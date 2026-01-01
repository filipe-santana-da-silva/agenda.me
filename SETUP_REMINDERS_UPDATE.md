# 🔧 Guia: Aplicar Alterações no Banco de Dados

## ⚠️ Importante

A tabela `reminders` precisa ser atualizada para adicionar o campo `appointment_id`. Se você já tem a tabela criada, execute este SQL:

---

## 📝 SQL para Adicionar o Campo

**Se a tabela JÁ existe**, execute:

```sql
-- Adicionar coluna appointment_id
ALTER TABLE reminders
ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_reminders_appointment_id ON reminders(appointment_id);
```

**Se a tabela NÃO existe**, execute o arquivo completo:
- `db/reminders_schema.sql`

---

## 🛠️ Como Executar no Supabase

### Opção 1: Via Dashboard

1. Acesse https://supabase.com/
2. Vá ao seu projeto
3. Clique em **SQL Editor** → **+ New Query**
4. Cole o SQL acima (ou do arquivo `reminders_schema.sql`)
5. Clique em **Run** ou `Ctrl + Enter`
6. Verifique a mensagem de sucesso

### Opção 2: Validar Alteração

Após executar, valide com:

```sql
-- Ver estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reminders'
ORDER BY ordinal_position;
```

**Resultado esperado:**
```
id              | uuid        | NO
user_id         | uuid        | NO
description     | text        | NO
appointment_id  | uuid        | YES     ← NOVO
created_at      | timestamp   | NO
updated_at      | timestamp   | NO
```

---

## ✅ Verificar Índices

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'reminders';
```

**Deve conter:**
- `idx_reminders_user_id`
- `idx_reminders_appointment_id` ← NOVO
- `idx_reminders_created_at`

---

## 🎉 Pronto!

Após executar o SQL, o sistema está pronto para usar:
- ✅ Criar lembretes
- ✅ Linkear com agendamentos
- ✅ Visualizar dados completos

---

## ❌ Se Houver Erro

**Erro: "relation 'appointments' does not exist"**
- Certifique-se que a tabela `appointments` foi criada
- Execute `db/agendamentos_schema.sql` primeiro

**Erro: "column 'appointment_id' already exists"**
- O campo já foi adicionado
- Você pode ignorar ou verificar se está funcionando

**Erro: "permission denied"**
- Verifique se você está usando a conexão correta
- Ou execute com role admin/owner
