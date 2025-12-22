# Sistema de Lembretes e Confirmação de Presença

## Funcionalidades Implementadas

### 1. Lembretes por Email (1h antes)
- **Endpoint**: `/api/reminders/send`
- **Funcionamento**: Busca agendamentos confirmados que precisam de lembrete
- **Critério**: Entre 0.5 e 1.5 horas antes do agendamento
- **Email**: Template profissional com botão de confirmação

### 2. Confirmação de Presença via Link
- **Página**: `/confirm/[token]`
- **Token**: Base64 com dados do agendamento + timestamp
- **Validade**: 24 horas
- **Atualiza**: `presence_confirmed = true` e `confirmed_at`

### 3. Cron Job Automático
- **Endpoint**: `/api/cron/reminders`
- **Uso**: Para serviços como Vercel Cron ou externos
- **Frequência sugerida**: A cada 30 minutos

## Campos Adicionados na Tabela `appointments`

```sql
ALTER TABLE appointments 
ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN presence_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;
```

## Como Configurar Cron Automático

### Opção 1: Vercel Cron (Recomendado)
Adicionar no `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

### Opção 2: Serviço Externo (cron-job.org)
- URL: `https://seudominio.com/api/cron/reminders`
- Frequência: A cada 30 minutos
- Método: GET ou POST

## Template do Email

O email inclui:
- ✅ Dados do agendamento (data, hora, serviço, profissional)
- 🔗 Botão de confirmação de presença
- 📱 Design responsivo
- ⏰ Assunto chamativo

## Fluxo Completo

1. **Agendamento criado** → `reminder_sent = false`
2. **Cron executa** → Verifica agendamentos próximos
3. **Email enviado** → `reminder_sent = true`
4. **Cliente clica** → Página de confirmação
5. **Presença confirmada** → `presence_confirmed = true`

## Próximas Melhorias Sugeridas

- [ ] Dashboard de estatísticas de confirmação
- [ ] Lembretes por WhatsApp/SMS
- [ ] Reagendamento via link
- [ ] Notificações para profissionais
- [ ] Relatório de no-show