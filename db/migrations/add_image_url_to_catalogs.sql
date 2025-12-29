-- Add image_url column to catalogs table
ALTER TABLE public.catalogs ADD COLUMN IF NOT EXISTS image_url text;
