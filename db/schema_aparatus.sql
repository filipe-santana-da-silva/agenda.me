-- Schema para replicar a estrutura do fullstackweekend-aparatus-v2 no Supabase
-- Baseado no schema.prisma

-- Tabela de Usuários (mapeada para auth.users do Supabase, mas criamos uma tabela de perfil)
CREATE TABLE IF NOT EXISTS "user" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Barbearias
CREATE TABLE IF NOT EXISTS barbershop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  phones TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Serviços das Barbearias
CREATE TABLE IF NOT EXISTS barbershop_service (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price_in_cents INTEGER NOT NULL,
  barbershop_id UUID NOT NULL REFERENCES barbershop(id) ON DELETE CASCADE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Agendamentos (Bookings)
CREATE TABLE IF NOT EXISTS booking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_charge_id TEXT,
  barbershop_id UUID NOT NULL REFERENCES barbershop(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES barbershop_service(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_barbershop_service_barbershop_id ON barbershop_service(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_barbershop_service_deleted_at ON barbershop_service(deleted_at);
CREATE INDEX IF NOT EXISTS idx_booking_user_id ON booking(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_barbershop_id ON booking(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_booking_service_id ON booking(service_id);
CREATE INDEX IF NOT EXISTS idx_booking_date ON booking(date);
CREATE INDEX IF NOT EXISTS idx_booking_cancelled_at ON booking(cancelled_at);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbershop_updated_at BEFORE UPDATE ON barbershop
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbershop_service_updated_at BEFORE UPDATE ON barbershop_service
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_updated_at BEFORE UPDATE ON booking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershop ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershop_service ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seus próprios dados
CREATE POLICY "Users can view own profile" ON "user"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON "user"
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Todos podem ver barbearias (público)
CREATE POLICY "Barbershops are viewable by everyone" ON barbershop
  FOR SELECT USING (true);

-- Policy: Todos podem ver serviços (público)
CREATE POLICY "Barbershop services are viewable by everyone" ON barbershop_service
  FOR SELECT USING (deleted_at IS NULL);

-- Policy: Usuários podem ver seus próprios agendamentos
CREATE POLICY "Users can view own bookings" ON booking
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Usuários podem criar seus próprios agendamentos
CREATE POLICY "Users can create own bookings" ON booking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar seus próprios agendamentos
CREATE POLICY "Users can update own bookings" ON booking
  FOR UPDATE USING (auth.uid() = user_id);

-- Comentários nas tabelas
COMMENT ON TABLE "user" IS 'Usuários do sistema';
COMMENT ON TABLE barbershop IS 'Barbearias cadastradas';
COMMENT ON TABLE barbershop_service IS 'Serviços oferecidos pelas barbearias';
COMMENT ON TABLE booking IS 'Agendamentos dos usuários';

