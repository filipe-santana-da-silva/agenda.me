-- Add image_url column to employees table
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_employees_image_url ON public.employees(image_url);
