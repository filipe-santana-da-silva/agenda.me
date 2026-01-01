# 🏗️ Arquitetura do Sistema de Lembretes Melhorado

## 📊 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│              Página: /private/agenda                        │
└──────────┬──────────────────────────────────────────────────┘
           │
           ├─ CalendarViewWithAppointments (exibe calendário)
           │
           └─ ReminderListLazy
              │
              ├─ getReminders() ───────────────────────────┐
              │                                             │
              │                    ┌────────────────────────┴────┐
              │                    ↓                              ↓
              │         ┌─────────────────────────┐   ┌──────────────────────┐
              │         │      reminders table     │   │   appointments table │
              │         ├─────────────────────────┤   ├──────────────────────┤
              │         │ id                      │   │ id                   │
              │         │ description             │   │ appointment_date     │
              │         │ appointment_id (FK) ────┼──→│ appointment_time     │
              │         │ created_at              │   │ status               │
              │         │ user_id (FK) ──────┐   │   │ customer_id (FK)     │
              │         └─────────────────────┼───┤   │ service_id (FK)      │
              │                               │   │   └──────────────────────┘
              │                               │   │             ↑
              │           ┌───────────────────┘   │             │
              │           ↓                       │      ┌──────┴──────┐
              │    ┌──────────────────┐           │      │             │
              │    │  auth.users      │           │      ↓             ↓
              │    ├──────────────────┤           │   ┌──────────┐  ┌─────────┐
              │    │ id (FK)          │           │   │customers │  │ services│
              │    │ email            │           │   └──────────┘  └─────────┘
              │    └──────────────────┘           │
              │                                   │
              └───────────────────────────────────┘
              
              │
              └─ ReminderList (novo lembrete)
                 │
                 ├─ reminder-form (validação)
                 │
                 ├─ getAppointmentsForReminders() ──────┐
                 │  (carrega dropdown)                   │
                 │                                       ↓
                 │                          ┌─────────────────────────┐
                 │                          │ SELECT appointments...  │
                 │                          │ WHERE status='scheduled'│
                 │                          └─────────────────────────┘
                 │
                 └─ createReminder() (server action)
                    │
                    └─ INSERT INTO reminders
                       (user_id, description, appointment_id)
```

---

## 🔄 Fluxo de Criação de Lembrete

```
1. Usuário clica no + em Lembretes
   ↓
2. Modal abre com formulário
   ├─ Campo: Descrição (obrigatório)
   └─ Campo: Agendamento (opcional)
   ↓
3. getAppointmentsForReminders() carrega lista
   ├─ Fetch: SELECT appointments...
   ├─ Filtra: status = 'scheduled'
   └─ Ordena: appointment_date ASC
   ↓
4. Usuário preenche formulário
   ├─ Digita descrição
   ├─ Seleciona agendamento (ou deixa "Sem agendamento")
   └─ Clica em "Cadastrar lembrete"
   ↓
5. createReminder() valida dados
   ├─ Zod valida schema
   ├─ Obtém user_id do auth
   └─ INSERT INTO reminders
   ↓
6. Toast de sucesso + revalidatePath
   ↓
7. getReminders() recarrega lista
   ├─ SELECT com JOINs
   └─ Exibe lembretes com dados do agendamento
```

---

## 📋 Estrutura de Dados: ReminderItem

```typescript
type ReminderItem = {
  // Campos do lembrete
  id: string                    // UUID
  description: string           // Texto do lembrete
  appointment_id?: string | null // UUID do agendamento (opcional)
  created_at?: string | null    // Data de criação
  updated_at?: string | null    // Data de atualização
  
  // Dados do agendamento (via JOIN)
  appointment?: {
    id: string
    appointment_date: string    // YYYY-MM-DD
    appointment_time: string    // HH:MM
    status: string | null       // 'scheduled', 'confirmed', etc
    
    customer?: {
      id: string
      name: string
      phone: string
    }
    
    service?: {
      id: string
      name: string
      price: number
    }
  } | null
}
```

---

## 🎨 Componentes (UI)

```
ReminderList (reminder-content.tsx)
│
├─ Card Header
│  ├─ Título: "Lembretes"
│  ├─ Contador: "N lembretes"
│  └─ Botão: + (abre dialog)
│
├─ Dialog (criar novo)
│  └─ ReminderList Form (reminder-list.tsx)
│     ├─ Textarea: descrição
│     ├─ Select: agendamento (com carregamento)
│     └─ Button: Cadastrar
│
└─ ScrollArea
   └─ Para cada lembrete:
      ├─ CheckCircle2 icon
      ├─ Descrição do lembrete
      ├─ [SE linkado] Dados do agendamento
      │  ├─ 🗓️ Data e Hora
      │  ├─ 👤 Nome do Cliente
      │  └─ 💼 Nome do Serviço
      └─ Button: Deletar (hover)
```

---

## 🔌 Server Actions

### createReminder()
```
Input:
├─ description: string (obrigatório)
└─ appointmentId: uuid | null (opcional)

Process:
├─ Validar com Zod
├─ Get auth user
└─ INSERT INTO reminders

Output:
├─ { data: "Sucesso!" }
└─ revalidatePath('/private/agenda')
```

### getReminders()
```
Input:
└─ userId: string

Process:
├─ SELECT * FROM reminders
├─ LEFT JOIN appointments
├─ LEFT JOIN customers
├─ LEFT JOIN services
└─ ORDER BY created_at DESC

Output:
└─ ReminderItem[]
```

### getAppointmentsForReminders()
```
Process:
├─ SELECT * FROM appointments
├─ LEFT JOIN customers
├─ LEFT JOIN services
├─ WHERE status = 'scheduled'
└─ ORDER BY appointment_date ASC

Output:
└─ Appointment[]
```

### deleteReminder()
```
Input:
└─ reminderId: uuid

Process:
└─ DELETE FROM reminders WHERE id = reminderId

Output:
└─ { data: "Deletado!" }
```

---

## 📊 Índices (Performance)

```sql
idx_reminders_user_id
├─ Usado em: WHERE user_id = ?
└─ Performance: O(log n)

idx_reminders_appointment_id
├─ Usado em: JOIN com appointments
└─ Performance: O(log n)

idx_reminders_created_at
├─ Usado em: ORDER BY created_at DESC
└─ Performance: O(log n)
```

---

## 🔐 Políticas de Segurança (RLS)

```
┌─ SELECT
│  └─ Usuário só vê seus lembretes
│     WHERE auth.uid() = user_id
│
├─ INSERT
│  └─ auth.uid() = user_id (automático)
│
├─ UPDATE
│  └─ auth.uid() = user_id (automático)
│
└─ DELETE
   └─ auth.uid() = user_id (automático)
```

---

## 📈 Escalabilidade

### Performance Atual
- ✅ Índices em user_id, appointment_id, created_at
- ✅ JOINs otimizados
- ✅ Não há N+1 queries
- ✅ Cascade bem definido

### Para Melhorar Futuramente
- [ ] Cache em Redis para listas grandes
- [ ] Pagination ao invés de scroll infinito
- [ ] Materialização de views para relatórios
- [ ] Full-text search em descrições

---

## 🛠️ Stack Tecnológico

```
Frontend:
├─ Next.js 15+ (App Router)
├─ React 18+
├─ React Hook Form (formulários)
├─ Zod (validação)
├─ TailwindCSS (estilo)
├─ Shadcn/ui (componentes)
└─ Sonner (toasts)

Backend:
├─ Next.js Server Actions
├─ Supabase (PostgreSQL)
├─ Row Level Security (autenticação)
└─ TypeScript

Database:
├─ PostgreSQL (via Supabase)
├─ Índices para performance
└─ Foreign Keys com cascade
```

---

## 📞 Diagrama de Integração

```
┌────────────────────────────────────────────────────────────┐
│                    /private/agenda                         │
│  (Página principal da agenda)                              │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐     ┌───────────────────────┐   │
│  │  CalendarView        │     │  ReminderList         │   │
│  │  (mostra eventos)    │     │  (mostra lembretes)   │   │
│  └──────────────────────┘     └───────────────────────┘   │
│         ↓                              ↓                   │
│   API: /api/                  Data-Access Functions       │
│   /clinic/appointments/all    ├─ getReminders()           │
│                               ├─ getAppointmentsForReminders()
│                               └─ deleteReminder()          │
│                                                             │
└──────────────────┬──────────────────────┬─────────────────┘
                   │                      │
                   ↓                      ↓
        ┌──────────────────┐   ┌─────────────────────┐
        │  Supabase         │   │  Supabase Auth      │
        │  PostgreSQL       │   │  (sessão do usuário)│
        │                   │   │                     │
        │ - reminders       │   │ - verify user       │
        │ - appointments    │   │ - validate token    │
        │ - customers       │   │                     │
        │ - services        │   │                     │
        └──────────────────┘   └─────────────────────┘
```

---

**Criado:** Janeiro 2026  
**Versão:** 2.0 - Com Linkagem de Agendamentos
