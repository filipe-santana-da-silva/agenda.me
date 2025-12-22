-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  cpf TEXT UNIQUE,
  position TEXT NOT NULL,
  department TEXT,
  hire_date DATE NOT NULL,
  salary NUMERIC(12, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  birth_date DATE,
  emergency_contact TEXT,
  emergency_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_hire_date ON employees(hire_date DESC);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view employees
CREATE POLICY "Authenticated users can view employees"
  ON employees
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to insert employees
CREATE POLICY "Authenticated users can insert employees"
  ON employees
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update employees
CREATE POLICY "Authenticated users can update employees"
  ON employees
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete employees
CREATE POLICY "Authenticated users can delete employees"
  ON employees
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employees_updated_at_trigger
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION update_employees_updated_at();

-- Grant permissions
GRANT ALL ON employees TO authenticated;
