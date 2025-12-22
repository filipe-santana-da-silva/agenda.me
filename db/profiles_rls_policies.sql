-- Habilitar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (true);

-- Política para permitir que usuários insiram seu próprio perfil
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (true);

-- Política para permitir que usuários atualizem seu próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (true);

-- Configurar bucket de storage para avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile', 'profile', true)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para permitir upload de avatares
CREATE POLICY "Anyone can upload avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile');

-- Política de storage para permitir visualização de avatares
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile');

-- Política de storage para permitir atualização de avatares
CREATE POLICY "Anyone can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile');

-- Política de storage para permitir exclusão de avatares
CREATE POLICY "Anyone can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile');
