# Supabase Row Level Security (RLS) Setup Guide

This guide will help you set up the necessary Row Level Security (RLS) policies for the Garden Buddy app to function correctly. These policies ensure that users can only access their own data while allowing community features to work properly.

## Why RLS Policies Are Needed

The app is currently experiencing issues with:
1. Image uploads failing with "new row violates row-level security policy" errors
2. Voting functionality not working
3. Missing diagnosis details in the dashboard

These issues are caused by missing or incorrect RLS policies in the Supabase database and storage buckets.

## How to Apply RLS Policies

Follow these steps in the Supabase dashboard:

> **IMPORTANT**: You must complete ALL steps below for the app to work properly. The most critical step is creating the storage bucket and policies in Step 4.

### 1. Access the SQL Editor

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### 2. Apply RLS Policies for the Diagnoses Table

Copy and paste the following SQL into the editor and click "Run":

```sql
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
```

### 3. Apply RLS Policies for the Community Votes Table

Copy and paste the following SQL into the editor and click "Run":

```sql
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
```

### 4. Create Storage Bucket and Policies

**This step is CRITICAL and must be completed for image uploads to work!**

1. In the Supabase dashboard, go to "Storage" in the left sidebar
2. Click "Create bucket"
3. Enter the following settings:
   - Name: `plant-images`
   - Public access: **Enabled** (important!)
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg,image/png,image/webp,image/jpg`
4. Click "Create bucket"

After creating the bucket, set up the RLS policies:

1. Go to "Storage" > "Policies"
2. Click on the "plant-images" bucket
3. Click "New Policy"
4. For each policy below, enter a policy name, select the template type, and paste the SQL:

Policy 1: Allow authenticated users to upload images
```sql
CREATE POLICY "Allow authenticated users to upload plant images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'plant-images');
```

Policy 2: Allow authenticated users to view images
```sql
CREATE POLICY "Allow authenticated users to view plant images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'plant-images');
```

Policy 3: Allow public access to view images
```sql
CREATE POLICY "Allow public access to view plant images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'plant-images');
```

### 5. Verify the Policies

1. In the Supabase dashboard, go to "Authentication" > "Policies"
2. Check that the policies for both the `diagnoses` and `community_votes` tables are listed
3. Each table should have the policies described above
4. Go to "Storage" > "Policies" and verify the `plant-images` bucket has the three policies listed above

## Testing the Changes

After applying these policies, restart your app and test the following functionality:

1. Upload a new plant image for diagnosis
2. View your diagnoses in the dashboard
3. Use the voting functionality on a diagnosis
4. View detailed diagnosis information by clicking on an image in the dashboard

All of these features should now work correctly without any RLS policy errors.

> **Note**: If you're still seeing "new row violates row-level security policy" errors when uploading images, double-check that you've created the `plant-images` bucket and added all three storage policies correctly.

## Troubleshooting

If you still encounter RLS policy errors:

1. Check the browser console for specific error messages
2. Verify that all policies were created successfully
3. Make sure you're using the correct Supabase credentials in your `.env.local` file
4. Ensure that users are properly authenticated before accessing protected resources
5. For storage bucket errors, try these steps:
   - Verify the `plant-images` bucket exists with public access enabled
   - Check that all three storage policies are correctly applied
   - Try logging out and logging back in to refresh your authentication token
   - If using the dashboard, make sure you're logged in with the same account you're testing with
