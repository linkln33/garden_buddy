-- Create storage bucket for plant images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-images',
  'plant-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload images to plant-images bucket
CREATE POLICY "Allow authenticated users to upload plant images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'plant-images');

-- Policy: Allow authenticated users to view their own uploaded images
CREATE POLICY "Allow authenticated users to view plant images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'plant-images');

-- Policy: Allow authenticated users to update their own uploaded images
CREATE POLICY "Allow authenticated users to update plant images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'plant-images')
WITH CHECK (bucket_id = 'plant-images');

-- Policy: Allow authenticated users to delete their own uploaded images
CREATE POLICY "Allow authenticated users to delete plant images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'plant-images');

-- Policy: Allow public access to view images (for sharing diagnoses)
CREATE POLICY "Allow public access to view plant images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'plant-images');
