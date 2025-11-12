Supabase storage policies for direct browser uploads (appointments bucket)

Overview
- This document explains how to enable direct browser uploads from authenticated users to the `appointments` storage bucket in Supabase.
- Two approaches are shown: a permissive-but-scoped policy (bucket-limited) and stricter policies that require object names or metadata to tie uploads to the uploader.
- The SQL is in `supabase/policies/storage_appointments_policies.sql`.

Apply (recommended: test in dev project first)
1) Supabase SQL editor (Dashboard)
   - Open your Supabase project dashboard -> SQL -> New query.
   - Paste the contents of `supabase/policies/storage_appointments_policies.sql` and run.

2) supabase CLI
   - Install and login: https://supabase.com/docs/guides/cli
   - Run (PowerShell example):

```powershell
# from repository root (adjust path if needed)
supabase db query "$(Get-Content -Raw ./supabase/policies/storage_appointments_policies.sql)"
```

Notes on keys and security
- These policies depend on Postgres RLS and Supabase auth. Browser clients must be signed in (auth.role() = 'authenticated').
- The permissive statements allow any authenticated user to upload/select/delete objects in the `appointments` bucket. If this is acceptable for your app it is the simplest route.
- For more security, use the stricter variants in the SQL (uncomment and adapt):
  - Require object `name` to start with the uploader's `auth.uid` (e.g. `userId/filename`).
  - Or require `metadata->>'user_id' = auth.uid`. When uploading from the browser, set that metadata field.

How to upload from the browser (example)
- Using @supabase/supabase-js (client), after the user signs in:

```ts
const file = input.files[0];
const user = supabase.auth.getUser(); // or use auth state
const bucket = 'appointments';
// recommended: prefix name with user id
const objectName = `${user.id}/${Date.now()}_${file.name}`;

const { data, error } = await supabase.storage
  .from(bucket)
  .upload(objectName, file, {
    cacheControl: '3600',
    upsert: false,
    // optional: include metadata to enable stricter policies
    metadata: { user_id: user.id }
  });

if (error) {
  console.error('upload error', error);
} else {
  const publicUrl = supabase.storage.from(bucket).getPublicUrl(objectName);
  console.log(publicUrl);
}
```

Testing
- After applying policies, test in a browser with an authenticated session. Try a small image/pdf upload.
- If you see RLS errors like `new row violates row-level security policy`, check:
  - Is the user actually authenticated (auth token present)?
  - Is the bucket name correct? (must be `appointments` in the SQL)
  - If using stricter policies, ensure your object name/metadata matches the policy expectations.

Rollback
- The SQL file contains DROP POLICY lines you can run to revert.

Recommendations / security guidance
- Prefer the stricter metadata or name-prefix policies if you care which user created which object.
- Keep the bucket private if files are sensitive; use signed URLs for downloads.
- Limit content types and size via application-level checks before upload (e.g. check file.type and file.size in the browser) and/or via policy checks if your storage schema supports them.
- Log uploads and monitor storage usage / costs.

If you want, I can:
- Implement the metadata name-prefix upload pattern in `utils/supabase/storage.ts` (client) so all uploads automatically prefix with `auth.uid` and set metadata.user_id. This makes stricter policies safe and easy to apply.
- Or implement server-signed-URL flow instead (more secure for private files).
