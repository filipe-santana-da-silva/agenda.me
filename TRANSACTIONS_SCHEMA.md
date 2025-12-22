# Schema SQL - Transações Financeiras

## Tabela Principal

```sql
-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Índices para Performance

```sql
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
```

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own transactions
CREATE POLICY "Users can insert their own transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own transactions
CREATE POLICY "Users can update their own transactions"
  ON transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own transactions
CREATE POLICY "Users can delete their own transactions"
  ON transactions
  FOR DELETE
  USING (auth.uid() = user_id);
```

## Triggers

```sql
-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at_trigger
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_transactions_updated_at();
```

## Permissões

```sql
-- Grant permissions
GRANT ALL ON transactions TO authenticated;
```

## Exemplos de Uso

### Inserir Nova Transação
```sql
INSERT INTO transactions (user_id, type, category, description, amount, date, payment_method, status)
VALUES (
  'user-uuid',
  'income',
  'Vendas',
  'Venda de produto X',
  150.00,
  '2025-01-15',
  'PIX',
  'completed'
);
```

### Atualizar Status
```sql
UPDATE transactions
SET status = 'completed'
WHERE id = 'transaction-uuid' AND user_id = 'user-uuid';
```

### Listar Transações do Mês
```sql
SELECT * FROM transactions
WHERE user_id = 'user-uuid'
  AND date >= '2025-01-01'
  AND date < '2025-02-01'
ORDER BY date DESC;
```

### Calcular Totais
```sql
SELECT
  SUM(CASE WHEN type = 'income' AND status = 'completed' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' AND status = 'completed' THEN amount ELSE 0 END) as total_expense,
  SUM(CASE WHEN status = 'pending' THEN (CASE WHEN type = 'income' THEN amount ELSE -amount END) ELSE 0 END) as pending
FROM transactions
WHERE user_id = 'user-uuid';
```

### Deletar Transação
```sql
DELETE FROM transactions
WHERE id = 'transaction-uuid' AND user_id = 'user-uuid';
```

## Notas Importantes

1. **user_id é obrigatório**: Sempre defina o user_id para garantir isolamento de dados
2. **RLS está ativo**: Sem políticas apropriadas, usuários não conseguem acessar dados
3. **Amount é positivo**: Valores devem ser sempre positivos; o tipo (income/expense) define o sinal
4. **Date é apenas data**: Sem horário; se precisar de horário, adicione uma coluna `time`
5. **Status padrão é 'pending'**: Transações criadas começam como pendentes
6. **Cascata de exclusão**: Deletar um usuário deleta automaticamente suas transações
