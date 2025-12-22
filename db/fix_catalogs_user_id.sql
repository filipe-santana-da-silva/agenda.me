-- Tornar coluna user_id opcional na tabela catalogs
ALTER TABLE public.catalogs ALTER COLUMN user_id DROP NOT NULL;

-- Remover foreign key constraint com auth.users
ALTER TABLE public.catalogs DROP CONSTRAINT IF EXISTS catalogs_user_id_fkey;
