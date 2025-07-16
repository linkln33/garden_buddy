# Supabase Storage Setup Guide

This guide will help you set up the required storage bucket for Garden Buddy's image upload functionality.

## Creating the 'plant-images' Bucket

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project
3. Navigate to "Storage" in the left sidebar
4. Click "New Bucket"
5. Enter the following details:
   - Name: `plant-images`
   - Public bucket: ✅ (checked)
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg,image/png,image/webp`
6. Click "Create bucket"

## Setting Up Storage Policies

After creating the bucket, you need to set up appropriate policies to allow authenticated users to upload images:

1. Click on the newly created `plant-images` bucket
2. Go to the "Policies" tab
3. Click "Add Policies"

### Policy 1: Allow authenticated users to upload files

1. Click "Create Policy"
2. Policy Type: Custom
3. Policy Name: `allow_authenticated_uploads`
4. Allowed Operations: `INSERT`
5. Policy Definition:
   ```sql
   (auth.role() = 'authenticated')
   ```
6. Click "Save Policy"

### Policy 2: Allow public access to view files

1. Click "Create Policy"
2. Policy Type: Custom
3. Policy Name: `allow_public_read`
4. Allowed Operations: `SELECT`
5. Policy Definition:
   ```sql
   true
   ```
6. Click "Save Policy"

### Policy 3: Allow users to manage their own files

1. Click "Create Policy"
2. Policy Type: Custom
3. Policy Name: `allow_user_manage_own_files`
4. Allowed Operations: `UPDATE, DELETE`
5. Policy Definition:
   ```sql
   (auth.uid() = owner)
   ```
6. Click "Save Policy"

## Troubleshooting

If you're still experiencing upload issues after setting up the bucket and policies:

1. Check that your Supabase URL and anon key in `.env.local` are correct
2. Ensure you're properly authenticated before attempting to upload
3. Check browser console for detailed error messages
4. Verify that the image file size is under the limit (5MB)
5. Make sure the image format is supported (JPEG, PNG, WebP)

After making these changes, restart your development server for the changes to take effect.
