-- Remover constraint de unicidade do CPF
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_cpf_key;

-- Tornar coluna CPF opcional
ALTER TABLE public.employees ALTER COLUMN cpf DROP NOT NULL;
