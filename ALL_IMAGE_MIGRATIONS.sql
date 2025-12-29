-- ============================================
-- IMAGE UPLOAD FEATURES - ALL MIGRATIONS
-- ============================================
-- Execute these migrations in Supabase SQL Editor
-- to enable image upload for products, services, and employees

-- ============================================
-- 1. ADD IMAGE_URL TO PRODUCTS TABLE
-- ============================================
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX IF NOT EXISTS idx_products_image_url ON public.products(image_url);

-- ============================================
-- 2. ADD IMAGE_URL TO SERVICES TABLE
-- ============================================
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX IF NOT EXISTS idx_services_image_url ON public.services(image_url);

-- ============================================
-- 3. ADD IMAGE_URL TO EMPLOYEES TABLE
-- ============================================
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE INDEX IF NOT EXISTS idx_employees_image_url ON public.employees(image_url);

-- ============================================
-- VERIFICATION QUERIES (run after migrations)
-- ============================================

-- Check products table
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url';

-- Check services table
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'image_url';

-- Check employees table
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'image_url';

-- ============================================
-- OPTIONAL: Populate existing records with NULL
-- (already defaults to NULL, only if you need to update existing rows)
-- ============================================

-- UPDATE public.products SET image_url = NULL WHERE image_url IS NULL;
-- UPDATE public.services SET image_url = NULL WHERE image_url IS NULL;
-- UPDATE public.employees SET image_url = NULL WHERE image_url IS NULL;
