-- Verificar se o hash está correto para a senha 792777
-- Execute este SQL para testar

-- 1. Ver dados atuais
SELECT email, password_plain, password_hash, 
       LENGTH(password_hash) as hash_length,
       SUBSTRING(password_hash, 1, 10) as hash_start
FROM public.system_users 
WHERE email = 'admin@agenda.me';

-- 2. Gerar novo hash correto para senha 792777 (execute no Node.js)
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('792777', 10);
-- console.log('Hash para 792777:', hash);

-- 3. Atualizar com hash correto (substitua HASH_AQUI pelo hash gerado)
-- UPDATE public.system_users 
-- SET password_hash = 'HASH_AQUI'
-- WHERE email = 'admin@agenda.me';

-- 4. Testar se o hash funciona (execute no Node.js)
-- const bcrypt = require('bcryptjs');
-- const isValid = bcrypt.compareSync('792777', 'HASH_DO_BANCO');
-- console.log('Senha válida:', isValid);