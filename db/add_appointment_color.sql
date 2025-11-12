-- Add color_index column to appointments table.
-- Run this in your Supabase SQL editor or psql connected to your project.
-- The repository uses both `Appointment` and `appointment` naming in code; run the statement for whichever table name exists.

-- Try lowercase table name (common in Postgres / Supabase):
ALTER TABLE IF EXISTS appointment
  ADD COLUMN IF NOT EXISTS color_index integer;

-- Also try quoted PascalCase table name if your DB was created that way:
ALTER TABLE IF EXISTS "Appointment"
  ADD COLUMN IF NOT EXISTS color_index integer;

-- Optionally: add an index for fast queries by color
CREATE INDEX IF NOT EXISTS idx_appointment_color_index ON public.appointment (color_index);
CREATE INDEX IF NOT EXISTS idx_Appointment_color_index ON public."Appointment" (color_index);

-- No default value is set; color_index is nullable. Null = "no color / white".
-- After running, the application will be able to read/write the integer color_index field.
