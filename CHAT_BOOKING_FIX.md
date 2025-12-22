# Fix: Criar Agendamento pelo Chat com Customer ID

## Problema
Não era possível criar agendamentos pelo chat porque:
1. O `customerId` não estava sendo propagado corretamente
2. A função `saveAppointment` no fluxo interativo não passava o `customerId`
3. O endpoint `/api/create-appointment` não suportava criação automática de cliente

## Solução Implementada

### 1. **Melhorias no Page Component** (`app/chat/page.tsx`)
- ✅ Adicionado check com optional chaining: `parsed?.name && parsed?.phone`
- ✅ Modificada função `saveAppointment` para:
  - Usar `customerId` obtido via `/api/register-customer`
  - Chamar novo endpoint `/api/create-appointment` com `customerId`
  - Suportar fallback com `bookingUser?.phone` como identificador único
  - Passar `customerName` e `customerPhone` para o endpoint

### 2. **Melhorias no Endpoint** (`app/api/create-appointment/route.ts`)
- ✅ Adicionado suporte a ambos formatos: camelCase e snake_case
- ✅ Implementada criação automática de cliente:
  - Busca cliente existente pelo telefone
  - Cria novo cliente se não existir
- ✅ Agora requer apenas `appointment_date` e `appointment_time` (ou `customerId`)
- ✅ Compatível com tanto o fluxo de chat quanto o fluxo interativo

### 3. **Melhorias no Chat Route** (`app/api/chat/route.ts`)
- ✅ Melhorado o `createAppointmentTool` para incluir `customerId` na resposta
- ✅ Sistema guiado está totalmente funcional com criação automática de cliente

## Fluxo Completo Agora

### Fluxo 1: Chat com AI (Mais Inteligente)
```
1. Usuário entra → localStorage carrega bookingUser (name, phone)
2. Chat chama /api/register-customer → cria/encontra cliente
3. customerId é salvo em state
4. AI guia o usuário pelos passos (serviço, profissional, data, hora)
5. createAppointmentTool é chamado com:
   - customerId
   - serviceId, appointmentDate, appointmentTime, professionalId
6. Agendamento é criado com sucesso
```

### Fluxo 2: Perguntas Interativas (Fallback)
```
1. Usuário responde perguntas sequenciais
2. saveAppointment coleta dados (serviço, profissional, data, hora)
3. Chama /api/create-appointment com:
   - customerId (se obtido) OU
   - customerName + customerPhone (cria cliente automaticamente)
4. Agendamento é criado com sucesso
```

## Dados Esperados

### POST /api/chat/messages
```json
{
  "messages": [...],
  "bookingUser": {
    "name": "João Silva",
    "phone": "(11) 98765-4321"
  }
}
```

### POST /api/create-appointment
Opção 1 (Com ID):
```json
{
  "customerId": "uuid-aqui",
  "serviceId": "uuid-aqui",
  "appointmentDate": "2025-12-25",
  "appointmentTime": "14:30",
  "professionalId": "uuid-aqui"
}
```

Opção 2 (Criar Cliente):
```json
{
  "customerName": "João Silva",
  "customerPhone": "(11) 98765-4321",
  "serviceId": "uuid-aqui",
  "appointmentDate": "2025-12-25",
  "appointmentTime": "14:30",
  "professionalId": "uuid-aqui"
}
```

## Validações

✅ Cliente existente com mesmo telefone → Reutilizado  
✅ Novo cliente → Criado automaticamente  
✅ Campo customerId não obrigatório se name + phone fornecidos  
✅ Agendamento não pode ser duplicado (mesmo horário + profissional)  
✅ Todos os endpoints com logs detalhados para debug  

## Testes Recomendados

1. **Novo visitante sem login**
   - Abre chat → preenche name/phone em localStorage
   - Inicia agendamento → deve criar cliente e agendamento

2. **Visitante retornando**
   - Telefone já existe → deve reutilizar cliente existente
   - Mesmo agendamento em hora diferente → deve ser permitido
   - Mesmo agendamento mesma hora → deve rejeitar

3. **Usuário autenticado**
   - Seus dados devem ser usados automaticamente
   - Deve funcionar como visitante se preferir

## Logs Disponíveis
- 📨 Registrando cliente: {...}
- ✅ Resposta do registro: {...}
- 🎉 Cliente registrado com ID: {...}
- 🔵 EXECUTANDO createAppointmentTool
- 📝 Criando agendamento com customerId: {...}
- 📊 Resultado agendamento: {...}
