# Página de Perfil - Documentação

## ✅ Funcionalidades Implementadas

### Aba 1: Informações Pessoais
- 👤 Avatar/Foto de perfil
- 📝 Nome completo (obrigatório)
- 📧 Email (somente leitura)
- 📱 Telefone
- 📍 Endereço
- 📄 Biografia
- 💾 Salvar alterações

### Aba 2: Segurança
- 🆔 ID da conta
- 📅 Data de membro desde
- 🚪 Botão para sair da conta

---

## 📊 Schema SQL Recomendado

Execute o seguinte SQL no Supabase para criar a tabela de perfis:

```sql
-- Tabela de Perfis de Usuários
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
COMMENT ON COLUMN public.profiles.email IS 'Email do usuário';
COMMENT ON COLUMN public.profiles.name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.phone IS 'Número de telefone';
COMMENT ON COLUMN public.profiles.address IS 'Endereço residencial/comercial';
COMMENT ON COLUMN public.profiles.bio IS 'Biografia ou descrição';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL da imagem de perfil';
COMMENT ON COLUMN public.profiles.created_at IS 'Data de criação';
COMMENT ON COLUMN public.profiles.updated_at IS 'Data da última atualização';

-- Índice para melhorar performance nas buscas
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Habilitar Row Level Security (RLS)
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
```

---

## 🏗️ Estrutura de Tabela

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID | ID do usuário (FK auth.users) | ✅ |
| `email` | TEXT | Email do usuário | ✅ |
| `name` | TEXT | Nome completo | ❌ |
| `phone` | TEXT | Telefone (10+ dígitos) | ❌ |
| `address` | TEXT | Endereço | ❌ |
| `bio` | TEXT | Biografia | ❌ |
| `avatar_url` | TEXT | URL da imagem de perfil | ❌ |
| `created_at` | TIMESTAMP | Data de criação | ✅ |
| `updated_at` | TIMESTAMP | Data da última atualização | ✅ |

---

## 🔐 Segurança Implementada

### Row Level Security (RLS)
- ✅ Usuários só podem ler seus próprios perfis
- ✅ Usuários só podem atualizar seus próprios dados
- ✅ Usuários só podem inserir seu próprio perfil
- ✅ Validação de constraints (email e telefone)

### Validações
- ✅ Nome obrigatório
- ✅ Email obrigatório e validado
- ✅ Telefone opcional, mas validado se preenchido
- ✅ Atualização automática de `updated_at`

---

## 🔄 Auto-trigger

Quando um novo usuário se registra:
1. O trigger `create_profile_on_signup_trigger` é acionado
2. Um novo registro é criado em `profiles`
3. O `id` e `email` são preenchidos automaticamente
4. Outros campos podem ser preenchidos posteriormente

---

## 📱 Campos Disponíveis

```typescript
type UserProfile = {
  id: string                    // UUID do usuário
  email: string                 // Email (não editável na interface)
  name: string | null           // Nome completo
  phone: string | null          // Telefone
  address: string | null        // Endereço
  bio: string | null            // Biografia
  avatar_url: string | null     // URL da imagem
  created_at?: string           // Data de criação
  updated_at?: string           // Última atualização
}
```

---

## 🚀 Como Usar

1. Execute o SQL no Supabase SQL Editor
2. Acesse `/private/profile` na aplicação
3. Preencha seus dados
4. Clique em "Salvar Alterações"
5. Suas informações serão armazenadas e atualizadas

---

## 📝 Notas Importantes

- O **email não pode ser alterado** via perfil (é controlado pelo Supabase Auth)
- O campo **avatar_url** ainda não está implementado com upload (será adicionado futuramente)
- As validações ocorrem tanto no **frontend** quanto no **banco de dados**
- O `updated_at` é atualizado **automaticamente** sempre que há mudanças

---

## 🔗 Arquivo de Schema SQL

O arquivo completo está em: `db/profiles_schema.sql`

Para importar no Supabase:
1. Abra o SQL Editor do Supabase
2. Crie uma nova query
3. Cole o conteúdo de `profiles_schema.sql`
4. Execute a query
