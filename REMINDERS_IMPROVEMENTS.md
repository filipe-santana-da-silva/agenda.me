# 📋 Melhorias no Sistema de Lembretes - Linkagem com Agendamentos

## 📌 Resumo das Alterações

O sistema de lembretes foi totalmente reformulado para permitir **linkagem opcional** com agendamentos. Agora você pode:

- ✅ Criar lembretes **independentes** (sem agendamento)
- ✅ Criar lembretes **linkados** a um agendamento específico
- ✅ Visualizar dados do agendamento direto no lembrete
- ✅ Gerenciar tudo na página `/private/agenda`

---

## 🗄️ Alterações no Banco de Dados

### 1. Schema Atualizado

**Arquivo:** `db/reminders_schema.sql`

```sql
-- Campo adicionado:
appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL

-- Novo índice:
CREATE INDEX idx_reminders_appointment_id ON reminders(appointment_id);
```

**Características:**
- Campo **OPCIONAL** (nullable)
- **Cascade**: Se um agendamento for deletado, o lembrete permanece com `appointment_id = NULL`
- Índice para performance em queries

---

## 🔄 Alterações no Código

### 1. Data Access - `get-reminder.ts`

**Mudança:** Agora busca dados do agendamento vinculado

```typescript
// ANTES
.from('Reminder')
.select('*')
.order('createdat', { ascending: false })

// DEPOIS
.from('reminders')
.select(`
  id,
  description,
  appointment_id,
  created_at,
  updated_at,
  appointment:appointment_id (
    id,
    appointment_date,
    appointment_time,
    status,
    customer:customer_id (id, name, phone),
    service:service_id (id, name, price)
  )
`)
.order('created_at', { ascending: false })
```

**Benefício:** Retorna dados completos do agendamento em um único JOIN

### 2. Novo Arquivo - `get-appointments-for-reminders.ts`

**Localização:** `app/private/agenda/_data-access/`

```typescript
export async function getAppointmentsForReminders() {
  // Busca apenas agendamentos com status 'scheduled'
  // Retorna: data, hora, cliente, serviço
}
```

**Uso:** Popula o dropdown de seleção no formulário

### 3. Form Schema - `reminder-form.tsx`

```typescript
// ANTES
z.object({
  description: z.string().min(1)
})

// DEPOIS
z.object({
  description: z.string().min(1),
  appointmentId: z.string().uuid().optional().nullable()
})
```

### 4. Formulário - `reminder-list.tsx`

**Novas Features:**
- Select dropdown para escolher agendamento
- Lista dinâmica de agendamentos disponíveis
- Formatação: `[Cliente] - [Serviço] (Data às Hora)`
- Opção "Sem agendamento" para lembretes independentes

```tsx
<Select value={field.value || ""} onValueChange={(value) => field.onChange(value || null)}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione um agendamento..." />
  </SelectTrigger>
  <SelectContent>
    {appointments.map((apt) => (
      <SelectItem key={apt.id} value={apt.id}>
        {apt.customer?.name} - {apt.service?.name} 
        ({date} às {time})
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 5. Server Action - `create-reminder.ts`

```typescript
// ANTES
.from('Reminder').insert([{ description, reminderdate, createdat }])

// DEPOIS
.from('reminders').insert([{ 
  user_id: user.id,
  description, 
  appointment_id: appointmentId || null 
}])
```

**Melhorias:**
- Valida `user_id` automaticamente
- Aceita `appointment_id` opcional
- Usa nome correto da tabela (`reminders`)

### 6. Exibição - `reminder-content.tsx`

**Nova estrutura visual:**

```
┌─ Lembrete: "Preparar documentos"
├─ 🗓️ 25/12/2024 às 14:30
├─ 👤 João Silva
└─ 💇 Corte de Cabelo
```

**Componentes adicionados:**
- Ícone de calendário + data/hora
- Ícone de usuário + nome do cliente
- Nome do serviço em destaque
- Seção de agendamento com border inferior para separação

---

## 🚀 Como Usar

### Criar Lembrete com Agendamento

1. Clique no botão **+** na seção de Lembretes
2. Digite a descrição do lembrete
3. **NOVO:** Selecione um agendamento no dropdown (opcional)
4. Clique em "Cadastrar lembrete"

### Criar Lembrete Independente

1. Clique no botão **+**
2. Digite a descrição
3. Deixe "Sem agendamento" selecionado
4. Clique em "Cadastrar lembrete"

### Visualizar Agendamento Linkado

- Se o lembrete tem um agendamento linkado, os detalhes aparecem abaixo da descrição
- Data, hora, cliente e serviço são exibidos automaticamente

---

## 🔒 Segurança (RLS)

As políticas de Row Level Security foram mantidas:
- ✅ Cada usuário só vê seus próprios lembretes
- ✅ Impossível acessar dados de outros usuários
- ✅ Autenticação obrigatória

---

## 📊 Estrutura Final da Tabela

```
reminders
├── id (UUID) - PK
├── user_id (UUID) - FK para auth.users
├── description (TEXT) - Descrição do lembrete
├── appointment_id (UUID, nullable) - FK para appointments [NOVO]
├── created_at (TIMESTAMP) - Auto
└── updated_at (TIMESTAMP) - Auto

Índices:
├── idx_reminders_user_id
├── idx_reminders_appointment_id [NOVO]
└── idx_reminders_created_at
```

---

## ⚠️ Importante: Executar SQL no Supabase

Para ativar essas alterações, execute o arquivo `db/reminders_schema.sql` no SQL Editor do Supabase:

1. Acesse https://supabase.com/
2. Vá para **SQL Editor**
3. Abra o arquivo `db/reminders_schema.sql`
4. Clique em **Run** para executar

**Nota:** A adição do campo `appointment_id` é uma **alteração não-destrutiva**. Lembretes existentes continuarão funcionando normalmente com `appointment_id = NULL`.

---

## 🎯 Próximas Melhorias Sugeridas

- [ ] Editar agendamento linkado de um lembrete
- [ ] Filtrar lembretes por agendamento
- [ ] Notificações automáticas próximas do horário
- [ ] Lembretes recorrentes
- [ ] Tags/categorias personalizadas

---

## 📝 Checklist de Implementação

- ✅ Schema atualizado
- ✅ Data access refatorado
- ✅ Formulário com seletor de agendamentos
- ✅ Server action atualizado
- ✅ Visualização melhorada
- ✅ Documentação criada

**Status:** 🟢 Pronto para uso
