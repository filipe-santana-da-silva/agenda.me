-- Verificar dados atuais da tabela
SELECT id, email, name, role, password_plain, 
       CASE WHEN password_plain IS NULL THEN 'SEM SENHA' ELSE 'COM SENHA' END as status_senha
FROM public.system_users 
ORDER BY created_at;

-- Definir senhas corretas para contas existentes
-- (Execute uma linha por vez para cada conta que você conhece a senha)

-- Admin padrão
UPDATE public.system_users 
SET password_plain = '123456' 
WHERE email = 'admin@agenda.me';

-- Para outras contas, defina as senhas que você conhece:
-- Exemplo:
-- UPDATE public.system_users 
-- SET password_plain = '654321' 
-- WHERE email = 'funcionario@teste.com';

-- Verificar novamente após as atualizações
SELECT id, email, name, role, password_plain, is_active
FROM public.system_users 
ORDER BY created_at;