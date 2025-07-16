-- Fix Row Level Security (RLS) policies for diagnoses table
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own diagnoses
CREATE POLICY diagnoses_insert_policy ON public.diagnoses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to select their own diagnoses
CREATE POLICY diagnoses_select_own_policy ON public.diagnoses
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to select public diagnoses (shared with community)
CREATE POLICY diagnoses_select_public_policy ON public.diagnoses
  FOR SELECT USING (shared_with_community = true);

-- Allow users to update their own diagnoses
CREATE POLICY diagnoses_update_policy ON public.diagnoses
  FOR UPDATE USING (auth.uid() = user_id);

-- Fix Row Level Security (RLS) policies for community_votes table
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;

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
