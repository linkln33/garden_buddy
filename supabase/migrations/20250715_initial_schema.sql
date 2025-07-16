-- Create users table with profile information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  location JSONB, -- Stores lat/long and location name
  preferred_crops TEXT[] DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{"push": true, "email": false}'::JSONB
);

-- Create diagnoses table for plant disease diagnoses
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  image_url TEXT NOT NULL,
  plant_type TEXT NOT NULL,
  disease_name TEXT NOT NULL,
  confidence_score FLOAT NOT NULL,
  ai_diagnosis JSONB NOT NULL, -- Stores full AI response
  community_diagnosis TEXT, -- Community-validated diagnosis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'disputed')) DEFAULT 'pending'
);

-- Create treatments table for tracking applied treatments
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnosis_id UUID REFERENCES public.diagnoses(id) NOT NULL,
  treatment_type TEXT CHECK (treatment_type IN ('organic', 'chemical')) NOT NULL,
  description TEXT NOT NULL,
  application_date TIMESTAMP WITH TIME ZONE,
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5)
);

-- Create community_votes table for community voting on diagnoses
CREATE TABLE IF NOT EXISTS public.community_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnosis_id UUID REFERENCES public.diagnoses(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  voted_disease TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (diagnosis_id, user_id) -- Each user can only vote once per diagnosis
);

-- Create weather_alerts table for weather-based spray recommendations
CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  alert_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('active', 'expired', 'dismissed')) DEFAULT 'active'
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON public.diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_confidence ON public.diagnoses(confidence_score);
CREATE INDEX IF NOT EXISTS idx_diagnoses_status ON public.diagnoses(status);
CREATE INDEX IF NOT EXISTS idx_treatments_diagnosis_id ON public.treatments(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_diagnosis_id ON public.community_votes(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_user_id ON public.weather_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_status ON public.weather_alerts(status);

-- Set up Row Level Security (RLS) policies
-- Users table: Users can only read/update their own data
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_policy ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_policy ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Diagnoses table: Users can read/update their own diagnoses, but can read others' if status is not 'pending'
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY diagnoses_select_own_policy ON public.diagnoses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY diagnoses_select_others_policy ON public.diagnoses
  FOR SELECT USING (status != 'pending' OR auth.uid() = user_id);

CREATE POLICY diagnoses_insert_policy ON public.diagnoses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY diagnoses_update_policy ON public.diagnoses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY diagnoses_delete_policy ON public.diagnoses
  FOR DELETE USING (auth.uid() = user_id);

-- Treatments table: Users can only read/update treatments for their own diagnoses
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY treatments_select_policy ON public.treatments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.diagnoses
      WHERE diagnoses.id = treatments.diagnosis_id
      AND diagnoses.user_id = auth.uid()
    )
  );

CREATE POLICY treatments_insert_policy ON public.treatments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.diagnoses
      WHERE diagnoses.id = treatments.diagnosis_id
      AND diagnoses.user_id = auth.uid()
    )
  );

CREATE POLICY treatments_update_policy ON public.treatments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.diagnoses
      WHERE diagnoses.id = treatments.diagnosis_id
      AND diagnoses.user_id = auth.uid()
    )
  );

-- Community_votes table: Users can read all votes but only insert/update their own
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_votes_select_policy ON public.community_votes
  FOR SELECT USING (true);

CREATE POLICY community_votes_insert_policy ON public.community_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY community_votes_update_policy ON public.community_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Weather_alerts table: Users can only read/update their own alerts
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY weather_alerts_select_policy ON public.weather_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY weather_alerts_insert_policy ON public.weather_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY weather_alerts_update_policy ON public.weather_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update diagnoses based on community votes
CREATE OR REPLACE FUNCTION update_community_diagnosis()
RETURNS TRIGGER AS $$
DECLARE
  total_votes INTEGER;
  majority_threshold INTEGER;
  majority_disease TEXT;
BEGIN
  -- Count total votes for this diagnosis
  SELECT COUNT(*) INTO total_votes
  FROM public.community_votes
  WHERE diagnosis_id = NEW.diagnosis_id;
  
  -- Set majority threshold (50% of votes + 1)
  majority_threshold := (total_votes / 2) + 1;
  
  -- Find the disease with the most votes
  SELECT voted_disease INTO majority_disease
  FROM public.community_votes
  WHERE diagnosis_id = NEW.diagnosis_id
  GROUP BY voted_disease
  HAVING COUNT(*) >= majority_threshold
  ORDER BY COUNT(*) DESC
  LIMIT 1;
  
  -- If there's a majority disease, update the diagnosis
  IF majority_disease IS NOT NULL THEN
    UPDATE public.diagnoses
    SET community_diagnosis = majority_disease,
        status = 'confirmed'
    WHERE id = NEW.diagnosis_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update community diagnosis when votes are added
CREATE TRIGGER community_votes_trigger
AFTER INSERT OR UPDATE ON public.community_votes
FOR EACH ROW
EXECUTE FUNCTION update_community_diagnosis();

-- Create function to automatically set diagnoses with low confidence to community review
CREATE OR REPLACE FUNCTION check_diagnosis_confidence()
RETURNS TRIGGER AS $$
BEGIN
  -- If confidence score is below 0.8 (80%), mark for community review
  IF NEW.confidence_score < 0.8 THEN
    NEW.status := 'pending';
  ELSE
    NEW.status := 'confirmed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check confidence score on new diagnoses
CREATE TRIGGER check_diagnosis_confidence_trigger
BEFORE INSERT ON public.diagnoses
FOR EACH ROW
EXECUTE FUNCTION check_diagnosis_confidence();
