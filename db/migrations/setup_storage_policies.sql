-- Setup for Supabase Storage bucket policies
-- This script should be executed in the Supabase SQL Editor

-- Create the images bucket if it doesn't exist (note: this can only be done via Supabase dashboard or API)
-- Go to Storage > Buckets > Create new bucket
-- Name: images
-- Public: ON (checkbox should be checked)

-- After creating the bucket, execute these policies:

-- Allow public reads on all files in images bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated uploads to images bucket
CREATE POLICY "Authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update their own uploads
CREATE POLICY "User can update own objects" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images'
    AND auth.uid() = owner
  );

-- Allow authenticated users to delete their own uploads
CREATE POLICY "User can delete own objects" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images'
    AND auth.uid() = owner
  );
