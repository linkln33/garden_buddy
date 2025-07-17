-- Storage policies for plant-images bucket
-- Execute this in Supabase Dashboard → SQL Editor

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to upload images to plant-images bucket
CREATE POLICY "Allow authenticated users to upload plant images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'plant-images');

-- Policy 2: Allow authenticated users to view images in plant-images bucket
CREATE POLICY "Allow authenticated users to view plant images" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'plant-images');

-- Policy 3: Allow public access to view images in plant-images bucket
CREATE POLICY "Allow public access to view plant images" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'plant-images');

-- Policy 4: Allow users to update their own uploaded images
CREATE POLICY "Allow users to update their own plant images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'plant-images' AND auth.uid()::text = owner);

-- Policy 5: Allow users to delete their own uploaded images
CREATE POLICY "Allow users to delete their own plant images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'plant-images' AND auth.uid()::text = owner);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
