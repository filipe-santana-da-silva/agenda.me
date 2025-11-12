-- Migration: create user_page_permission
-- Tracks per-user page-level permissions (optional). If you prefer a different model (JSON column), tell me.

CREATE TABLE IF NOT EXISTS public.user_page_permission (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  page_id uuid NOT NULL,
  can_view boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Index to quickly look up by email
CREATE INDEX IF NOT EXISTS idx_user_page_permission_email ON public.user_page_permission (lower(email));
