# Schema SQL - Funcionários

## Tabela Principal

```sql
-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  cpf TEXT UNIQUE,
  position TEXT NOT NULL,
  department TEXT,
  hire_date DATE NOT NULL,
  salary NUMERIC(12, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  birth_date DATE,
  emergency_contact TEXT,
  emergency_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Campos da Tabela

| Campo | Tipo | Requerido | Descrição |
|-------|------|-----------|-----------|
| id | UUID | ✅ | Identificador único |
| name | TEXT | ✅ | Nome completo do funcionário |
| email | TEXT | ✅ | Email único |
| phone | TEXT | ❌ | Telefone de contato |
| cpf | TEXT | ❌ | CPF único |
| position | TEXT | ✅ | Cargo/Posição |
| department | TEXT | ❌ | Departamento |
| hire_date | DATE | ✅ | Data de admissão |
| salary | NUMERIC | ❌ | Salário mensal |
| status | TEXT | ✅ | Status (active, inactive, on_leave) |
| address | TEXT | ❌ | Endereço |
| city | TEXT | ❌ | Cidade |
| state | TEXT | ❌ | Estado (UF) |
| zip_code | TEXT | ❌ | CEP |
| birth_date | DATE | ❌ | Data de nascimento |
| emergency_contact | TEXT | ❌ | Nome do contato emergência |
| emergency_phone | TEXT | ❌ | Telefone de emergência |
| notes | TEXT | ❌ | Observações |
| created_at | TIMESTAMP | ✅ | Data de criação (auto) |
| updated_at | TIMESTAMP | ✅ | Data de atualização (auto) |

## Índices para Performance

```sql
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_hire_date ON employees(hire_date DESC);
```

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view employees
CREATE POLICY "Authenticated users can view employees"
  ON employees
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to insert employees
CREATE POLICY "Authenticated users can insert employees"
  ON employees
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update employees
CREATE POLICY "Authenticated users can update employees"
  ON employees
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete employees
CREATE POLICY "Authenticated users can delete employees"
  ON employees
  FOR DELETE
  USING (auth.role() = 'authenticated');
```

## Triggers

```sql
-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employees_updated_at_trigger
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION update_employees_updated_at();
```

## Exemplos de Uso

### Inserir Novo Funcionário
```sql
INSERT INTO employees (name, email, phone, cpf, position, department, hire_date, salary, status)
VALUES (
  'João Silva',
  'joao@example.com',
  '(11) 98765-4321',
  '123.456.789-00',
  'Recepcionista',
  'Administrativo',
  '2025-01-01',
  2500.00,
  'active'
);
```

### Listar Funcionários Ativos
```sql
SELECT name, email, position, department, salary
FROM employees
WHERE status = 'active'
ORDER BY name;
```

### Calcular Folha de Pagamento
```sql
SELECT
  department,
  COUNT(*) as total,
  SUM(salary) as total_salary,
  AVG(salary) as avg_salary
FROM employees
WHERE status = 'active'
GROUP BY department
ORDER BY department;
```

### Atualizar Status
```sql
UPDATE employees
SET status = 'on_leave'
WHERE id = 'employee-uuid';
```

### Deletar Funcionário
```sql
DELETE FROM employees
WHERE id = 'employee-uuid';
```

## Notas Importantes

1. **Email e CPF são únicos**: Não é possível registrar dois funcionários com o mesmo email ou CPF
2. **Status padrão é 'active'**: Novos funcionários começam como ativos
3. **Salário é opcional**: Pode ser NULL se não houver salário definido
4. **Acesso de dados**: Apenas usuários autenticados podem acessar
5. **Auto-update**: O campo `updated_at` é atualizado automaticamente
6. **Índices**: Estão definidos para melhorar performance nas buscas mais comuns
