-- Garden Buddy: Complete RLS Policy Fix
-- Execute this in Supabase Dashboard SQL Editor

-- 1. Fix diagnoses table RLS policies
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS diagnoses_insert_policy ON public.diagnoses;
DROP POLICY IF EXISTS diagnoses_select_own_policy ON public.diagnoses;
DROP POLICY IF EXISTS diagnoses_select_public_policy ON public.diagnoses;
DROP POLICY IF EXISTS diagnoses_update_policy ON public.diagnoses;

-- Allow users to insert their own diagnoses
CREATE POLICY diagnoses_insert_policy ON public.diagnoses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to select their own diagnoses
CREATE POLICY diagnoses_select_own_policy ON public.diagnoses
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to select public diagnoses (not pending status)
CREATE POLICY diagnoses_select_public_policy ON public.diagnoses
  FOR SELECT USING (status != 'pending');

-- Allow users to update their own diagnoses
CREATE POLICY diagnoses_update_policy ON public.diagnoses
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. Fix community_votes table RLS policies
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS community_votes_insert_policy ON public.community_votes;
DROP POLICY IF EXISTS community_votes_select_policy ON public.community_votes;
DROP POLICY IF EXISTS community_votes_update_policy ON public.community_votes;
DROP POLICY IF EXISTS community_votes_delete_policy ON public.community_votes;

-- Allow users to insert their own votes
CREATE POLICY community_votes_insert_policy ON public.community_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to select all votes (for counting)
CREATE POLICY community_votes_select_policy ON public.community_votes
  FOR SELECT USING (true);

-- Allow users to update their own votes
CREATE POLICY community_votes_update_policy ON public.community_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own votes
CREATE POLICY community_votes_delete_policy ON public.community_votes
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Storage bucket policies (execute these separately in Storage > Policies)
-- Note: These need to be created through the Supabase Dashboard UI, not SQL Editor

-- Policy 1: Allow authenticated users to upload images
-- CREATE POLICY "Allow authenticated users to upload plant images"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'plant-images');

-- Policy 2: Allow authenticated users to view images  
-- CREATE POLICY "Allow authenticated users to view plant images"
-- ON storage.objects
-- FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'plant-images');

-- Policy 3: Allow public access to view images
-- CREATE POLICY "Allow public access to view plant images"
-- ON storage.objects
-- FOR SELECT
-- TO public
-- USING (bucket_id = 'plant-images');

-- Success message
SELECT 'RLS policies updated successfully! Now create the storage bucket and policies manually.' as status;
