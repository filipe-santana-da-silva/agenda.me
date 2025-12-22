-- Atualizar todas as contas existentes com senhas padrão
-- Execute este script no Supabase para definir senhas em texto plano para contas existentes

-- Primeiro, adicionar a coluna se não existir
ALTER TABLE public.system_users ADD COLUMN IF NOT EXISTS password_plain text;

-- Atualizar contas existentes que não têm password_plain definido
-- Definindo senhas padrão baseadas no padrão de 6 dígitos

-- Admin padrão
UPDATE public.system_users 
SET password_plain = '123456' 
WHERE email = 'admin@agenda.me' AND password_plain IS NULL;

-- Para outras contas existentes, gerar senhas baseadas no ID (últimos 6 dígitos)
-- ou definir uma senha padrão
UPDATE public.system_users 
SET password_plain = CASE 
    WHEN role = 'ADMIN' THEN '123456'
    ELSE LPAD(ABS(HASHTEXT(id::text) % 1000000)::text, 6, '0')
END
WHERE password_plain IS NULL;

-- Alternativa: definir senha padrão '000000' para todas as contas sem password_plain
-- UPDATE public.system_users 
-- SET password_plain = '000000' 
-- WHERE password_plain IS NULL;

-- Ver todas as contas atualizadas
SELECT id, email, name, role, password_plain, is_active 
FROM public.system_users 
ORDER BY created_at;