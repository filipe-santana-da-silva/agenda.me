-- Tabela de Perfis de Usuários
-- Esta tabela armazena informações adicionais dos usuários autenticados no Supabase Auth
-- O id é uma chave estrangeira que referencia auth.users(id)

CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  name text,
  phone text,
  address text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW(),
  
  CONSTRAINT profiles_phone_format CHECK (phone IS NULL OR phone ~ '^\d{10,}'),
  CONSTRAINT profiles_email_format CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);

-- Comentários descritivos
COMMENT ON TABLE public.profiles IS 'Perfil extendido de usuários do sistema';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário (referência ao auth.users)';
COMMENT ON COLUMN public.profiles.email IS 'Email do usuário (herdado de auth.users)';
COMMENT ON COLUMN public.profiles.name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.phone IS 'Número de telefone (10+ dígitos)';
COMMENT ON COLUMN public.profiles.address IS 'Endereço residencial/comercial';
COMMENT ON COLUMN public.profiles.bio IS 'Biografia ou descrição do usuário';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL da imagem de perfil';
COMMENT ON COLUMN public.profiles.created_at IS 'Data de criação do perfil';
COMMENT ON COLUMN public.profiles.updated_at IS 'Data da última atualização';

-- Índice para melhorar performance nas buscas por email
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Políticas de Segurança em Nível de Linha (RLS)
-- Habilitar RLS na tabela
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler seus próprios perfis
CREATE POLICY "Usuários podem ler seus perfis"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuários podem atualizar seus próprios perfis
CREATE POLICY "Usuários podem atualizar seus perfis"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política: Usuários podem inserir seu próprio perfil
CREATE POLICY "Usuários podem inserir seus perfis"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política: Apenas admins podem deletar perfis (opcional)
-- CREATE POLICY "Apenas admins podem deletar perfis"
--   ON public.profiles
--   FOR DELETE
--   USING (
--     EXISTS (
--       SELECT 1 FROM auth.users
--       WHERE auth.users.id = auth.uid()
--       AND auth.users.raw_user_meta_data->>'role' = 'admin'
--     )
--   );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- Criar função para inserir perfil automaticamente quando um novo usuário se registra
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Executar função no evento de novo usuário
CREATE TRIGGER create_profile_on_signup_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_on_signup();
