-- RBAC tables: role, page, user_permission, user_page_permission, rolepermission

create table public.role (
  id uuid not null default gen_random_uuid(),
  name text not null,
  constraint role_pkey primary key (id),
  constraint role_name_key unique (name)
) TABLESPACE pg_default;

create table public.page (
  id uuid not null default gen_random_uuid(),
  name text not null,
  route text null,
  constraint page_pkey primary key (id),
  constraint page_name_key unique (name)
) TABLESPACE pg_default;

create table public.user_permission (
  id uuid not null default gen_random_uuid(),
  email text not null,
  role_id uuid null,
  created_at timestamp without time zone null default now(),
  constraint user_permission_pkey primary key (id),
  constraint user_permission_email_key unique (email),
  constraint user_permission_role_id_fkey foreign key (role_id) references role (id)
) TABLESPACE pg_default;

create table public.user_page_permission (
  id uuid not null default gen_random_uuid(),
  email text not null,
  pages jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default now(),
  page_id uuid null,
  can_view boolean null default true,
  constraint user_page_permission_pkey primary key (id),
  constraint user_page_permission_email_key unique (email),
  constraint user_page_permission_page_id_fkey foreign key (page_id) references page (id)
) TABLESPACE pg_default;

create table public.rolepermission (
  id uuid not null default gen_random_uuid(),
  role_id uuid null,
  permission_id uuid null,
  constraint rolepermission_pkey primary key (id),
  constraint rolepermission_role_id_permission_id_key unique (role_id, permission_id),
  constraint rolepermission_role_id_fkey foreign key (role_id) references role (id) on delete cascade
) TABLESPACE pg_default;

-- Optionally seed basic roles
insert into role (name) select 'ADMIN' where not exists (select 1 from role where name = 'ADMIN');
insert into role (name) select 'RECREADOR' where not exists (select 1 from role where name = 'RECREADOR');
