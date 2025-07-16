-- Update community_votes table to add vote_value column
ALTER TABLE public.community_votes ADD COLUMN IF NOT EXISTS vote_value BOOLEAN NOT NULL DEFAULT true;

-- Update the schema to remove the voted_disease column which is no longer needed
-- First make it nullable to avoid issues with existing data
ALTER TABLE public.community_votes ALTER COLUMN voted_disease DROP NOT NULL;

-- Add a comment to explain the vote_value column
COMMENT ON COLUMN public.community_votes.vote_value IS 'true = upvote, false = downvote';

-- Add an index for faster queries on vote_value
CREATE INDEX IF NOT EXISTS idx_community_votes_value ON public.community_votes(vote_value);

-- Update RLS policies for community_votes table
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;

-- Users can read all community votes
CREATE POLICY IF NOT EXISTS community_votes_select_policy ON public.community_votes
  FOR SELECT USING (true);

-- Users can only insert their own votes
CREATE POLICY IF NOT EXISTS community_votes_insert_policy ON public.community_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own votes
CREATE POLICY IF NOT EXISTS community_votes_update_policy ON public.community_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own votes
CREATE POLICY IF NOT EXISTS community_votes_delete_policy ON public.community_votes
  FOR DELETE USING (auth.uid() = user_id);
