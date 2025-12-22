-- Temporariamente desabilitar RLS para debug
ALTER TABLE public.system_users DISABLE ROW LEVEL SECURITY;

-- Para reabilitar depois:
-- ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;