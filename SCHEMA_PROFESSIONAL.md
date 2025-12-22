# Schema: Adicionar Campo de Profissional nos Agendamentos

## Resumo das Alterações

Este documento descreve as mudanças implementadas para adicionar suporte a profissionais (employees) nos agendamentos, usando a tabela `employees` como referência.

## 1. Schema do Banco de Dados

### Coluna Adicionada

```sql
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
```

**Campo:** `professional_id`
- **Tipo:** UUID
- **Referência:** `employees(id)` (tabela de funcionários)
- **Nullable:** Sim (opcional)
- **Ação ao deletar:** SET NULL (preserva o agendamento, remove referência)
- **Índice:** Criado para melhor performance em queries

## 2. Tabelas Relacionadas

### `appointments` (modificada)
```
id (UUID) - Primary Key
appointment_date (DATE)
appointment_time (TIME)
status (VARCHAR)
customer_id (UUID) - FK para customers
service_id (UUID) - FK para services
professional_id (UUID) - FK para employees [NOVO]
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
color_index (INT)
```

### `employees` (referenciada)
```
id (UUID) - Primary Key
name (TEXT) - Nome do funcionário
email (TEXT) - Email (único)
phone (TEXT) - Telefone
cpf (TEXT) - CPF (único)
position (TEXT) - Cargo/Posição
department (TEXT) - Departamento
hire_date (DATE) - Data de contratação
salary (NUMERIC) - Salário
status (TEXT) - Status (active, inactive, on_leave)
address (TEXT) - Endereço
city (TEXT) - Cidade
state (TEXT) - Estado
zip_code (TEXT) - CEP
birth_date (DATE) - Data de nascimento
emergency_contact (TEXT) - Contato de emergência
emergency_phone (TEXT) - Telefone de emergência
notes (TEXT) - Observações
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

## 3. Interface TypeScript

```typescript
type Professional = { 
  id: string
  name: string
  email: string
  position?: string
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status?: string | null
  name?: string
  eventname?: string
  color_index?: number
  phone?: string
  email?: string
  customer_id?: string
  service_id?: string
  professional_id?: string  // [NOVO]
  created_at?: string
  updated_at?: string
  service?: {
    id: string
    name: string
    duration: number
    price: number
  }
  professional?: {  // [NOVO]
    id: string
    name: string
    email: string
    position?: string
  }
}
```

## 4. Componentes Modificados

### A. Formulário de Novo Agendamento
**Arquivo:** `app/private/agenda/new/new-appointment-client.tsx`

**Alterações:**
- ✅ Carrega lista de funcionários ativos da tabela `employees`
- ✅ Filtra apenas employees com status = 'active'
- ✅ Campo Select para escolher profissional (opcional)
- ✅ Exibe profissional selecionado no resumo
- ✅ Envia `professional_id` ao salvar

**Carregamento:**
```tsx
const { data: professionalsData } = await supabase
  .from("employees")
  .select("id, name, email, position")
  .eq("status", "active")
  .order("name")
```

### B. API de Agendamentos
**Arquivo:** `app/api/clinic/appointments/all/route.ts`

**Alterações:**
- ✅ Retorna dados do profissional via LEFT JOIN
- ✅ Inclui nome, email e cargo do profissional
- ✅ Query otimizada com índices

**Query atualizada:**
```typescript
select(`
  id,
  appointment_date,
  appointment_time,
  status,
  created_at,
  updated_at,
  customer:customer_id (id, name, phone),
  service:service_id (id, name, duration, price),
  professional:professional_id (id, name, email, position)  // [NOVO]
`)
```

### C. Componente de Visualização de Calendário
**Arquivo:** `app/components/calendar-view-appointments.tsx`

**Alterações:**
- ✅ Atualizada interface `Appointment` com campos de profissional
- ✅ Adicionada seção de "Profissional" no modal de detalhes
- ✅ Exibe nome, cargo e email do profissional

**Exibição no modal:**
```tsx
{apt.professional && (
  <div className="border-t pt-4">
    <p className="text-sm font-bold text-gray-900 mb-2">Profissional</p>
    <div className="space-y-1 text-sm">
      <p className="text-gray-900">
        <span className="font-semibold">Nome:</span> {apt.professional.name}
      </p>
      {apt.professional.position && (
        <p className="text-gray-900">
          <span className="font-semibold">Cargo:</span> {apt.professional.position}
        </p>
      )}
      {apt.professional.email && (
        <p className="text-gray-900">
          <span className="font-semibold">Email:</span> {apt.professional.email}
        </p>
      )}
    </div>
  </div>
)}
```

## 5. Fluxo de Dados

```
1. Criação de Agendamento
   └─ NewAppointmentClient
      ├─ Carrega funcionários ativos (employees)
      ├─ Usuário seleciona profissional
      └─ Envia para API com professional_id

2. Armazenamento
   └─ INSERT INTO appointments (..., professional_id)
      └─ Cria FK para employees(id)

3. Visualização
   └─ CalendarViewWithAppointments
      ├─ Busca via /api/clinic/appointments/all
      ├─ API retorna JOINs com dados de employees
      └─ Exibe nome, cargo e email no modal
```

## 6. Queries Úteis

### Listar profissionais disponíveis
```sql
SELECT id, name, email, position FROM employees 
WHERE status = 'active' 
ORDER BY name;
```

### Agendamentos por profissional
```sql
SELECT a.*, e.name as professional_name, e.position
FROM appointments a
LEFT JOIN employees e ON a.professional_id = e.id
WHERE e.id = 'employee-uuid'
ORDER BY a.appointment_date;
```

### Carga de trabalho por profissional
```sql
SELECT 
  e.name, 
  e.position,
  COUNT(a.id) as total_appointments,
  DATE(a.appointment_date) as appointment_date
FROM employees e
LEFT JOIN appointments a ON e.id = a.professional_id
WHERE a.appointment_date >= CURRENT_DATE
GROUP BY e.id, a.appointment_date
ORDER BY e.name, a.appointment_date;
```

### Agendamentos sem profissional atribuído
```sql
SELECT * FROM appointments 
WHERE professional_id IS NULL
ORDER BY appointment_date;
```

## 7. Vantagens da Abordagem com Employees

- ✅ Integração natural com sistema de RH
- ✅ Acesso a dados completos do funcionário (cpf, cargo, etc)
- ✅ Gerenciamento centralizado de profissionais
- ✅ Histórico completo de funcionários (ativos e inativos)
- ✅ Campos extras (salário, departamento, dados pessoais)
- ✅ Validação de status (apenas ativos por padrão)

## 8. Notas Importantes

- ✅ Campo é **opcional** - agendamentos podem existir sem profissional
- ✅ **Compatibilidade** - mudanças não quebram agendamentos existentes
- ✅ **Performance** - índice criado para otimizar queries
- ✅ **Cascata** - ao deletar employee, agendamentos mantêm dados históricos
- ✅ **Integridade** - FK garante que professional_id sempre aponta a um employee válido
- ✅ **Status** - apenas employees ativos aparecem na seleção

## 9. Próximas Implementações Sugeridas

1. Filtrar agendamentos por profissional na visualização
2. Relatório de carga de trabalho por profissional
3. Notificações para profissionais quando agendamento é atribuído
4. Edição de profissional em agendamentos existentes
5. Dashboard de disponibilidade de profissionais
6. Validação de conflito de horários por profissional
7. Integração com folha de pagamento baseada em agendamentos

