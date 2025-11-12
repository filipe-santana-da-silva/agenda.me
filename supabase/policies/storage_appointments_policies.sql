-- Policies for allowing authenticated browser uploads to the 'appointments' bucket
-- Run these in Supabase SQL editor or via the supabase CLI (in a dev project first!)

-- 1) Allow authenticated users to INSERT into storage.objects for the appointments bucket
CREATE POLICY "allow_authenticated_insert_appointments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'appointments' AND
  auth.role() = 'authenticated'
);

-- 2) Allow authenticated users to SELECT objects from the appointments bucket
CREATE POLICY "allow_authenticated_select_appointments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'appointments' AND
  auth.role() = 'authenticated'
);

-- 3) Allow authenticated users to DELETE only objects in appointments bucket
-- (Optionally tighten below to only allow deleting objects created by the same user)
CREATE POLICY "allow_authenticated_delete_appointments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'appointments' AND
  auth.role() = 'authenticated'
);

-- OPTIONAL: Stricter policies (recommended for better security)
-- These require either the object name to include the auth.uid prefix, or metadata.user_id to match auth.uid.
-- To use this approach, when uploading from the browser, make object names like "{user_id}/{timestamp}_{filename}"
-- or include metadata: { "user_id": "<auth.uid>" }

-- Example: require object name to start with auth.uid
-- CREATE POLICY "allow_insert_appointments_name_prefix"
-- ON storage.objects
-- FOR INSERT
-- WITH CHECK (
--   bucket_id = 'appointments' AND
--   auth.role() = 'authenticated' AND
--   name LIKE concat(auth.uid, '/%')
-- );

-- Example: require metadata user_id to equal auth.uid (if you include that metadata at upload)
-- CREATE POLICY "allow_insert_appointments_metadata_user"
-- ON storage.objects
-- FOR INSERT
-- WITH CHECK (
--   bucket_id = 'appointments' AND
--   auth.role() = 'authenticated' AND
--   (metadata ->> 'user_id') = auth.uid
-- );

-- OPTIONAL: Content-type / size restrictions
-- Note: storage.objects has "content_type" column which you can check in a WITH CHECK clause.
-- You can add checks like (content_type IN ('application/pdf', 'image/png', 'image/jpeg'))
-- and perhaps a size field in metadata if you populate it client-side.

-- ROLLBACK: drop the policies if you need to revert
-- DROP POLICY IF EXISTS "allow_authenticated_insert_appointments" ON storage.objects;
-- DROP POLICY IF EXISTS "allow_authenticated_select_appointments" ON storage.objects;
-- DROP POLICY IF EXISTS "allow_authenticated_delete_appointments" ON storage.objects;
-- (Also drop any optional stricter policies you created.)

-- IMPORTANT: If your bucket is private (recommended), consider whether you want public access to uploaded files.
-- If you want files to be publicly accessible right away, you can make the bucket public from the Supabase dashboard.
-- If you want private files, keep the bucket private and use signed URLs for downloads.

-- Always test these policies in a non-production environment before applying to production.
