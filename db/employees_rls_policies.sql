-- Enable RLS on employees table
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (you can restrict later based on your auth system)
CREATE POLICY "Allow all access to employees" ON public.employees
FOR ALL
USING (true)
WITH CHECK (true);

-- If you want to restrict by authenticated users only, use this instead:
-- CREATE POLICY "Allow authenticated access to employees" ON public.employees
-- FOR ALL
-- TO authenticated
-- USING (true)
-- WITH CHECK (true);
