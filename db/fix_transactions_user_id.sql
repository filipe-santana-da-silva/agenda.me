-- Tornar a coluna user_id opcional na tabela transactions
ALTER TABLE public.transactions 
ALTER COLUMN user_id DROP NOT NULL;

-- Ou se preferir, definir um valor padrão UUID
-- ALTER TABLE public.transactions 
-- ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;
