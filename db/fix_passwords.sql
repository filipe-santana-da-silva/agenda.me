-- Corrigir senhas das contas existentes
-- Execute este SQL no Supabase para sincronizar as senhas

-- Atualizar conta admin com senha correta
UPDATE public.system_users 
SET password_plain = '123456' 
WHERE email = 'admin@agenda.me';

-- Para outras contas que você conhece a senha, atualize manualmente:
-- UPDATE public.system_users 
-- SET password_plain = 'SENHA_REAL_AQUI' 
-- WHERE email = 'email@exemplo.com';

-- Ver todas as contas para identificar quais precisam ser atualizadas
SELECT id, email, name, role, password_plain, is_active 
FROM public.system_users 
ORDER BY created_at;