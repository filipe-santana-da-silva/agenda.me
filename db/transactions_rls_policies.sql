-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all access to transactions
CREATE POLICY "Allow all access to transactions" ON public.transactions
FOR ALL
USING (true)
WITH CHECK (true);
