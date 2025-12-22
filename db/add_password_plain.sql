-- Adicionar coluna para senha em texto plano (apenas para visualização)
ALTER TABLE public.system_users ADD COLUMN IF NOT EXISTS password_plain text;