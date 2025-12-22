-- Migration: Add professional_id to appointments table
-- Description: Add a field to track which professional/employee performs the appointment

-- Add professional_id column to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);

-- Add a comment to describe the column
COMMENT ON COLUMN appointments.professional_id IS 'Reference to the employee who will perform the service';

