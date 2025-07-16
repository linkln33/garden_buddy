-- Migration for adding weather-related tables to Garden Buddy
-- This adds fields, field_alerts, and spray_events tables

-- Create fields table for storing user field polygons
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  crop_type TEXT DEFAULT 'general',
  area FLOAT,
  notes TEXT
);

-- Add RLS policies for fields table
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own fields
CREATE POLICY "Users can view their own fields" ON public.fields
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own fields
CREATE POLICY "Users can insert their own fields" ON public.fields
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own fields
CREATE POLICY "Users can update their own fields" ON public.fields
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own fields
CREATE POLICY "Users can delete their own fields" ON public.fields
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX fields_user_id_idx ON public.fields (user_id);

-- Create field_alerts table for storing weather alerts specific to fields
CREATE TABLE IF NOT EXISTS public.field_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for field_alerts table
ALTER TABLE public.field_alerts ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own alerts
CREATE POLICY "Users can view their own field alerts" ON public.field_alerts
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own alerts
CREATE POLICY "Users can insert their own field alerts" ON public.field_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own alerts
CREATE POLICY "Users can update their own field alerts" ON public.field_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX field_alerts_field_id_idx ON public.field_alerts (field_id);
CREATE INDEX field_alerts_user_id_idx ON public.field_alerts (user_id);

-- Create spray_events table for tracking scheduled spray applications
CREATE TABLE IF NOT EXISTS public.spray_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  best_time_of_day TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  weather_conditions JSONB,
  notes TEXT
);

-- Add RLS policies for spray_events table
ALTER TABLE public.spray_events ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own spray events
CREATE POLICY "Users can view their own spray events" ON public.spray_events
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own spray events
CREATE POLICY "Users can insert their own spray events" ON public.spray_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own spray events
CREATE POLICY "Users can update their own spray events" ON public.spray_events
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own spray events
CREATE POLICY "Users can delete their own spray events" ON public.spray_events
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX spray_events_field_id_idx ON public.spray_events (field_id);
CREATE INDEX spray_events_user_id_idx ON public.spray_events (user_id);
CREATE INDEX spray_events_scheduled_date_idx ON public.spray_events (scheduled_date);

-- Add trigger to automatically set user_id from field_id
CREATE OR REPLACE FUNCTION public.set_spray_event_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := (SELECT user_id FROM public.fields WHERE id = NEW.field_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_spray_event_user_id_trigger
BEFORE INSERT ON public.spray_events
FOR EACH ROW
WHEN (NEW.user_id IS NULL)
EXECUTE FUNCTION public.set_spray_event_user_id();

-- Add trigger to automatically set user_id from field_id for alerts
CREATE OR REPLACE FUNCTION public.set_field_alert_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := (SELECT user_id FROM public.fields WHERE id = NEW.field_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_field_alert_user_id_trigger
BEFORE INSERT ON public.field_alerts
FOR EACH ROW
WHEN (NEW.user_id IS NULL)
EXECUTE FUNCTION public.set_field_alert_user_id();
