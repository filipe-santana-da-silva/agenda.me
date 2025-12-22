-- Create professional_revenue table to track revenue per professional
CREATE TABLE IF NOT EXISTS public.professional_revenue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL,
  appointment_id uuid NOT NULL,
  transaction_id uuid,
  service_name text NOT NULL,
  customer_name text NOT NULL,
  revenue numeric(12, 2) NOT NULL,
  revenue_date date NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp without time zone NULL DEFAULT now(),
  updated_at timestamp without time zone NULL DEFAULT now(),
  CONSTRAINT professional_revenue_pkey PRIMARY KEY (id),
  CONSTRAINT professional_revenue_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.employees(id) ON DELETE CASCADE,
  CONSTRAINT professional_revenue_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE,
  CONSTRAINT professional_revenue_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Create indexes for faster queries
CREATE INDEX idx_professional_revenue_professional_id ON public.professional_revenue(professional_id);
CREATE INDEX idx_professional_revenue_appointment_id ON public.professional_revenue(appointment_id);
CREATE INDEX idx_professional_revenue_date ON public.professional_revenue(revenue_date);
CREATE INDEX idx_professional_revenue_status ON public.professional_revenue(status);
