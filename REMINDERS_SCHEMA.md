# Schema SQL - Reminders (Lembretes)

## Tabela Principal

```sql
-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Campos da Tabela

| Campo | Tipo | Requerido | Descrição |
|-------|------|-----------|-----------|
| id | UUID | ✅ | Identificador único |
| user_id | UUID | ✅ | ID do usuário (FK) |
| description | TEXT | ✅ | Descrição do lembrete |
| created_at | TIMESTAMP | ✅ | Data de criação (auto) |
| updated_at | TIMESTAMP | ✅ | Data de atualização (auto) |

## Índices para Performance

```sql
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_created_at ON reminders(created_at DESC);
```

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own reminders
CREATE POLICY "Users can view their own reminders"
  ON reminders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own reminders
CREATE POLICY "Users can insert their own reminders"
  ON reminders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reminders
CREATE POLICY "Users can update their own reminders"
  ON reminders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own reminders
CREATE POLICY "Users can delete their own reminders"
  ON reminders
  FOR DELETE
  USING (auth.uid() = user_id);
```

## Triggers

```sql
-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reminders_updated_at_trigger
BEFORE UPDATE ON reminders
FOR EACH ROW
EXECUTE FUNCTION update_reminders_updated_at();
```

## Exemplos de Uso

### Inserir Novo Lembrete
```sql
INSERT INTO reminders (user_id, description)
VALUES (
  'user-uuid',
  'Comprar materiais para a clínica'
);
```

### Listar Lembretes do Usuário
```sql
SELECT id, description, created_at
FROM reminders
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

### Atualizar Descrição
```sql
UPDATE reminders
SET description = 'Comprar materiais novos para a clínica'
WHERE id = 'reminder-uuid' AND user_id = 'user-uuid';
```

### Deletar Lembrete
```sql
DELETE FROM reminders
WHERE id = 'reminder-uuid' AND user_id = 'user-uuid';
```

### Contar Lembretes
```sql
SELECT COUNT(*) as total
FROM reminders
WHERE user_id = 'user-uuid';
```

## Notas Importantes

1. **user_id é obrigatório**: Cada lembrete está vinculado a um usuário específico
2. **RLS está ativo**: Usuários só acessam seus próprios lembretes
3. **Descrição é obrigatória**: Não pode ser NULL ou vazia
4. **Auto-update**: O campo `updated_at` é atualizado automaticamente em modificações
5. **Cascata de exclusão**: Deletar um usuário deleta automaticamente seus lembretes
6. **Ordenação padrão**: Por data de criação descendente (mais recentes primeiro)

## Relacionamentos

- **users → reminders**: Um usuário pode ter muitos lembretes (1:N)
- **Cascata**: Ao deletar um usuário, todos seus lembretes são deletados automaticamente

## Performance

- **Índices**: Otimizados para buscas por usuário e ordenação por data
- **Queries típicas**: Rápidas com os índices definidos
- **Escalabilidade**: Suporta milhões de lembretes com performance adequada
