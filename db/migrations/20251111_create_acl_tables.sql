-- Migration: Create ACL tables for Access Control List architecture
-- Adds roles, resources, role_permissions, user_roles and user_permissions

BEGIN;

-- roles
CREATE TABLE IF NOT EXISTS acl_roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- resources (pages, or other named resources)
CREATE TABLE IF NOT EXISTS acl_resources (
  id SERIAL PRIMARY KEY,
  name TEXT,
  path TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- role -> resource permissions
CREATE TABLE IF NOT EXISTS acl_role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES acl_roles(id) ON DELETE CASCADE,
  resource_id INTEGER NOT NULL REFERENCES acl_resources(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'view', -- keep flexible (e.g. view, edit)
  allowed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (role_id, resource_id, permission)
);

-- user -> role assignments
CREATE TABLE IF NOT EXISTS acl_user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  role_id INTEGER NOT NULL REFERENCES acl_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role_id)
);

-- user -> resource permissions (overrides per-user)
CREATE TABLE IF NOT EXISTS acl_user_permissions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  resource_id INTEGER NOT NULL REFERENCES acl_resources(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'view',
  allowed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, resource_id, permission)
);

-- optional: seed some common roles
INSERT INTO acl_roles (name, description)
  SELECT 'ADMIN', 'Administrador do sistema' WHERE NOT EXISTS (SELECT 1 FROM acl_roles WHERE name = 'ADMIN');

INSERT INTO acl_roles (name, description)
  SELECT 'RECREADOR', 'Usuário com perfil de recreador' WHERE NOT EXISTS (SELECT 1 FROM acl_roles WHERE name = 'RECREADOR');

COMMIT;

-- Notes:
-- 1) This design keeps 'resources' as explicit rows (recommended) so the UI can list pages and map checkboxes to resource rows.
-- 2) `user_id` is UUID, matching Supabase Auth user IDs. If your app stores user IDs in a different column/type, adapt accordingly.
-- 3) After applying, you'll want to seed `acl_resources` with your app pages (e.g. '/private/agenda', '/private/recreadores', etc.)
-- 4) Update your middleware to check the following (in order):
--    a) explicit user permission in acl_user_permissions (if present, obey allowed flag);
--    b) roles assigned via acl_user_roles -> check acl_role_permissions for the resource;
--    c) fallback: existing role-based default behavior (if you want backward compatibility).
-- 5) If you prefer a single-table ACL (subject_type / subject_id / resource / permission / allowed) instead of normalized tables, we can provide that alternative.
