-- Add appointment_id foreign key to transactions table
ALTER TABLE public.transactions 
ADD COLUMN appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL;

-- Create index for faster queries by appointment
CREATE INDEX idx_transactions_appointment_id ON public.transactions(appointment_id);

-- Create index for queries by user and date
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date);
