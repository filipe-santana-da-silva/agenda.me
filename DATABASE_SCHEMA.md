# 🗄️ Schema Completo do Banco de Dados

## Visão Geral
Sistema de gestão para salões de beleza e barbearias com controle de agendamentos, clientes, serviços, produtos, financeiro e RBAC.

---

## 📋 Tabelas Principais

### 1. **system_users** (Usuários do Sistema)
Tabela customizada para autenticação e controle de acesso.

```sql
CREATE TABLE system_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_plain TEXT, -- Senha em texto plano (6 dígitos numéricos)
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'FUNCIONARIO')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_users_email ON system_users(email);
CREATE INDEX idx_system_users_role ON system_users(role);
```

**Campos:**
- `id`: UUID único do usuário
- `email`: Email único para login
- `password_hash`: Senha criptografada com bcrypt
- `password_plain`: Senha em texto plano para exibição (6 dígitos)
- `role`: ADMIN ou FUNCIONARIO
- `active`: Status do usuário

---

### 2. **user_permissions** (Permissões de Usuário)
Controle granular de acesso às páginas do sistema.

```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES system_users(id) ON DELETE CASCADE,
  page_route TEXT NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, page_route)
);

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_page_route ON user_permissions(page_route);
```

**Rotas disponíveis:**
- `agenda`, `clientes`, `servicos`, `produtos`, `catalogos`
- `financeiro`, `funcionarios`, `planos`, `permissoes`, `profile`, `suporte`

---

### 3. **customers** (Clientes)
Cadastro de clientes do salão.

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  cpf TEXT,
  birth_date DATE,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers(name);
```

---

### 4. **services** (Serviços)
Serviços oferecidos pelo salão.

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTERVAL NOT NULL, -- Ex: '01:00:00' para 1 hora
  price NUMERIC(12,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_services_active ON services(active);
```

---

### 5. **employees** (Funcionários)
Cadastro de funcionários/profissionais.

```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  cpf TEXT UNIQUE,
  phone TEXT,
  position TEXT, -- Ex: 'Cabeleireiro', 'Manicure'
  department TEXT,
  hire_date DATE,
  salary NUMERIC(12,2),
  commission_rate NUMERIC(5,2), -- Percentual de comissão
  status TEXT CHECK (status IN ('active', 'inactive', 'on_leave')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_cpf ON employees(cpf);
```

---

### 6. **appointments** (Agendamentos)
Agendamentos de clientes para serviços.

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  color TEXT, -- Cor para visualização no calendário
  notes TEXT,
  created_by UUID REFERENCES system_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_employee ON appointments(employee_id);
CREATE INDEX idx_appointments_status ON appointments(status);
```

---

### 7. **categories** (Categorias de Produtos)
Categorias para organização de produtos.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 8. **products** (Produtos)
Estoque e catálogo de produtos.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  cost_price NUMERIC(12,2), -- Preço de custo
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0, -- Estoque mínimo para alerta
  sku TEXT UNIQUE, -- Código do produto
  barcode TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(active);
```

---

### 9. **catalogs** (Catálogos)
Catálogos de produtos para WhatsApp/Marketing.

```sql
CREATE TABLE catalogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 10. **catalog_items** (Itens do Catálogo)
Produtos incluídos em cada catálogo.

```sql
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  catalog_id UUID REFERENCES catalogs(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(catalog_id, product_id)
);

CREATE INDEX idx_catalog_items_catalog ON catalog_items(catalog_id);
CREATE INDEX idx_catalog_items_product ON catalog_items(product_id);
```

---

### 11. **transactions** (Transações Financeiras)
Receitas e despesas do salão.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES system_users(id),
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category TEXT NOT NULL, -- Ex: 'Serviço', 'Produto', 'Aluguel', 'Salário'
  description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL,
  payment_method TEXT, -- Ex: 'Dinheiro', 'Cartão', 'PIX'
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'completed',
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
```

---

### 12. **reminders** (Lembretes)
Lembretes e notas rápidas.

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES system_users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_completed ON reminders(completed);
```

---

### 13. **profiles** (Perfis de Usuário)
Informações adicionais do perfil.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES system_users(id) ON DELETE CASCADE UNIQUE,
  name TEXT,
  phone TEXT,
  address TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_user ON profiles(user_id);
```

---

## 🔗 Relacionamentos

```
system_users (1) ──→ (N) user_permissions
system_users (1) ──→ (N) transactions
system_users (1) ──→ (N) reminders
system_users (1) ──→ (1) profiles
system_users (1) ──→ (N) appointments (created_by)

customers (1) ──→ (N) appointments
services (1) ──→ (N) appointments
employees (1) ──→ (N) appointments
employees (1) ──→ (N) transactions

categories (1) ──→ (N) products
catalogs (1) ──→ (N) catalog_items
products (1) ──→ (N) catalog_items

appointments (1) ──→ (0..1) transactions
```

---

## 🔒 Row Level Security (RLS)

### Políticas Implementadas:

**system_users:**
- Apenas ADMIN pode visualizar e gerenciar usuários

**user_permissions:**
- Apenas ADMIN pode gerenciar permissões

**transactions:**
- Usuários veem apenas suas próprias transações
- ADMIN vê todas as transações

**reminders:**
- Usuários veem apenas seus próprios lembretes

**appointments, customers, services, products:**
- Acesso baseado em permissões da tabela user_permissions

---

## 📊 Índices para Performance

Todos os índices criados:
- `email`, `role` em system_users
- `user_id`, `page_route` em user_permissions
- `phone`, `name` em customers
- `active` em services
- `status`, `cpf` em employees
- `appointment_date`, `customer_id`, `employee_id`, `status` em appointments
- `category_id`, `sku`, `active` em products
- `user_id`, `date`, `type`, `status` em transactions
- `user_id`, `completed` em reminders

---

## 🚀 Triggers

**Auto-update de updated_at:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas
CREATE TRIGGER update_system_users_updated_at BEFORE UPDATE ON system_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- (repetir para todas as tabelas)
```

---

## 📈 Estatísticas e Métricas

### Queries Úteis:

**Total de agendamentos por status:**
```sql
SELECT status, COUNT(*) 
FROM appointments 
GROUP BY status;
```

**Receita total por período:**
```sql
SELECT SUM(amount) 
FROM transactions 
WHERE type = 'income' 
  AND date BETWEEN '2024-01-01' AND '2024-12-31';
```

**Produtos com estoque baixo:**
```sql
SELECT name, stock, min_stock 
FROM products 
WHERE stock <= min_stock 
  AND active = true;
```

**Funcionários mais produtivos:**
```sql
SELECT e.name, COUNT(a.id) as total_appointments
FROM employees e
LEFT JOIN appointments a ON e.id = a.employee_id
WHERE a.status = 'completed'
GROUP BY e.id, e.name
ORDER BY total_appointments DESC;
```

---

## 🔧 Manutenção

### Backup Recomendado:
```bash
pg_dump -h localhost -U postgres -d agenda_db > backup_$(date +%Y%m%d).sql
```

### Limpeza de Dados Antigos:
```sql
-- Remover agendamentos cancelados com mais de 1 ano
DELETE FROM appointments 
WHERE status = 'cancelled' 
  AND created_at < NOW() - INTERVAL '1 year';
```

---

## 📝 Notas Importantes

1. **Senhas**: Sistema usa bcrypt para hash + texto plano para exibição
2. **UUIDs**: Todos os IDs são UUID v4 para distribuição uniforme
3. **Timestamps**: Todos com timezone awareness
4. **Valores Monetários**: NUMERIC(12,2) para precisão
5. **Soft Delete**: Usar campo `active` ao invés de DELETE
6. **Auditoria**: Campos created_at/updated_at em todas as tabelas

---

## 🎯 Próximas Melhorias

- [ ] Tabela de audit_logs para rastreamento de mudanças
- [ ] Tabela de notifications para alertas do sistema
- [ ] Tabela de payment_plans para planos SaaS
- [ ] Tabela de customer_history para histórico de atendimentos
- [ ] Tabela de inventory_movements para controle de estoque
