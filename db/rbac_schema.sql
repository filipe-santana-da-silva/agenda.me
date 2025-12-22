-- Schema para sistema RBAC
-- Criação de tabelas para usuários e permissões

-- Tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS public.system_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'FUNCIONARIO' CHECK (role IN ('ADMIN', 'FUNCIONARIO')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.system_users(id)
);

-- Função para gerar senha numérica de 6 dígitos
CREATE OR REPLACE FUNCTION generate_numeric_password()
RETURNS text AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_system_users_email ON public.system_users (lower(email));
CREATE INDEX IF NOT EXISTS idx_system_users_role ON public.system_users (role);
CREATE INDEX IF NOT EXISTS idx_system_users_active ON public.system_users (is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_users_updated_at 
    BEFORE UPDATE ON public.system_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios dados, exceto ADMINs
CREATE POLICY "Users can view own data or admins can view all" ON public.system_users
    FOR SELECT USING (
        auth.uid()::text = id::text OR 
        EXISTS (
            SELECT 1 FROM public.system_users 
            WHERE id::text = auth.uid()::text AND role = 'ADMIN'
        )
    );

-- Política: Apenas ADMINs podem inserir novos usuários
CREATE POLICY "Only admins can insert users" ON public.system_users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.system_users 
            WHERE id::text = auth.uid()::text AND role = 'ADMIN'
        )
    );

-- Política: Usuários podem atualizar seus próprios dados, ADMINs podem atualizar qualquer um
CREATE POLICY "Users can update own data or admins can update all" ON public.system_users
    FOR UPDATE USING (
        auth.uid()::text = id::text OR 
        EXISTS (
            SELECT 1 FROM public.system_users 
            WHERE id::text = auth.uid()::text AND role = 'ADMIN'
        )
    );

-- Política: Apenas ADMINs podem deletar usuários
CREATE POLICY "Only admins can delete users" ON public.system_users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.system_users 
            WHERE id::text = auth.uid()::text AND role = 'ADMIN'
        )
    );

-- Inserir usuário admin padrão (senha: 123456)
INSERT INTO public.system_users (email, name, password_hash, role) 
VALUES (
    'admin@agenda.me', 
    'Administrador', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- hash de '123456'
    'ADMIN'
) ON CONFLICT (email) DO NOTHING;