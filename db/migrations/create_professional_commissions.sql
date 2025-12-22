-- Create professional_commissions table to track commissions earned by professionals
CREATE TABLE IF NOT EXISTS public.professional_commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL,
  appointment_id uuid NOT NULL,
  transaction_id uuid,
  service_name text NOT NULL,
  customer_name text NOT NULL,
  service_price numeric(12, 2) NOT NULL,
  commission_rate numeric(5, 2) NOT NULL DEFAULT 0.00,
  commission_amount numeric(12, 2) NOT NULL,
  commission_period date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_date timestamp without time zone,
  notes text,
  created_at timestamp without time zone NULL DEFAULT now(),
  updated_at timestamp without time zone NULL DEFAULT now(),
  CONSTRAINT professional_commissions_pkey PRIMARY KEY (id),
  CONSTRAINT professional_commissions_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.employees(id) ON DELETE CASCADE,
  CONSTRAINT professional_commissions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE,
  CONSTRAINT professional_commissions_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Create indexes for faster queries
CREATE INDEX idx_professional_commissions_professional_id ON public.professional_commissions(professional_id);
CREATE INDEX idx_professional_commissions_appointment_id ON public.professional_commissions(appointment_id);
CREATE INDEX idx_professional_commissions_period ON public.professional_commissions(commission_period);
CREATE INDEX idx_professional_commissions_status ON public.professional_commissions(status);
CREATE INDEX idx_professional_commissions_paid_date ON public.professional_commissions(paid_date);

-- Add commission_rate column to services table if not exists
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS commission_rate numeric(5, 2) DEFAULT 15.00;
