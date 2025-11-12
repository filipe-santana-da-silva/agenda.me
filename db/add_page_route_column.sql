-- Add nullable `route` column to `page` and populate sensible defaults
-- Run this in your Supabase SQL editor or via psql connected to your database.

BEGIN;

ALTER TABLE IF EXISTS public.page
  ADD COLUMN IF NOT EXISTS route text;

-- Populate common known pages to the intended private routes.
-- Adjust these mappings if your routes differ.
UPDATE public.page
SET route = CASE lower(name)
  WHEN 'agendamentos' THEN '/private/agenda'
  WHEN 'meu perfil' THEN '/private/profile'
  WHEN 'perfil' THEN '/private/profile'
  WHEN 'malas' THEN '/private/malas'
  WHEN 'estoque' THEN '/private/estoque'
  WHEN 'recreadores' THEN '/private/recreadores'
  WHEN 'contratantes' THEN '/private/contratantes'
  WHEN 'contratos' THEN '/private/contratos'
  WHEN 'ranking' THEN '/private/ranking'
  WHEN 'permissoes' THEN '/private/permissoes'
  WHEN 'dashboard' THEN '/private'
  ELSE '/private/' || lower(regexp_replace(name, '\\s+', '-', 'g'))
END
WHERE route IS NULL OR route = '';

COMMIT;
