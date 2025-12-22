# Sistema de Agenda Inteligente

## Funcionalidades Implementadas

### 1. **Bloqueio Automático de Horários**
- **Horários de almoço**: Configurável por profissional
- **Intervalos**: Múltiplos intervalos personalizáveis
- **Bloqueios recorrentes**: Aplicados automaticamente
- **API**: `/api/schedule/blocks`

### 2. **Sugestões de Reagendamento**
- **Algoritmo inteligente**: Baseado em proximidade temporal
- **Score de prioridade**: Considera horário original e preferências
- **Múltiplas opções**: Top 5 melhores sugestões
- **Validade**: Sugestões expiram em 7 dias
- **API**: `/api/schedule/suggestions`

### 3. **Otimização Automática da Agenda**
- **Análise de gaps**: Identifica espaços vazios entre agendamentos
- **Minimização de intervalos**: Reduz tempo ocioso
- **Score de otimização**: Quantifica melhorias possíveis
- **Sugestões automáticas**: Propõe novos horários
- **API**: `/api/schedule/optimize`

### 4. **Painel de Controle Inteligente**
- **Estatísticas em tempo real**: Gaps, scores, agendamentos
- **Controles manuais**: Botões para executar otimizações
- **Visualização de sugestões**: Interface amigável
- **Componente**: `SmartSchedulePanel`

## Estrutura do Banco de Dados

### Tabela `schedule_settings`
```sql
- id (SERIAL PRIMARY KEY)
- professional_id (FK employees)
- day_of_week (0-6, domingo=0)
- start_time, end_time (TIME)
- lunch_start, lunch_end (TIME)
- break_intervals (JSONB) - Array de intervalos
- is_active (BOOLEAN)
```

### Tabela `schedule_blocks`
```sql
- id (SERIAL PRIMARY KEY)
- professional_id (FK employees)
- block_date (DATE)
- start_time, end_time (TIME)
- block_type (lunch, break, maintenance, personal)
- reason (TEXT)
- is_recurring (BOOLEAN)
```

### Tabela `reschedule_suggestions`
```sql
- id (SERIAL PRIMARY KEY)
- original_appointment_id (FK appointments)
- suggested_date (DATE)
- suggested_time (TIME)
- professional_id (FK employees)
- priority_score (INTEGER)
- expires_at (TIMESTAMP)
```

### Campos Adicionados em `appointments`
```sql
- is_optimized (BOOLEAN) - Se foi analisado
- optimization_score (INTEGER) - Score de otimização
- gap_before_minutes (INTEGER) - Gap antes do agendamento
- gap_after_minutes (INTEGER) - Gap depois do agendamento
```

## Algoritmos Implementados

### 1. **Algoritmo de Bloqueio Automático**
```typescript
1. Buscar configurações do profissional para o dia da semana
2. Criar bloqueio para horário de almoço (se configurado)
3. Criar bloqueios para intervalos (array de intervalos)
4. Usar UPSERT para evitar duplicatas
5. Marcar como recorrente para aplicação automática
```

### 2. **Algoritmo de Sugestão de Reagendamento**
```typescript
1. Buscar dados do agendamento cancelado
2. Gerar slots disponíveis para próximos 7 dias
3. Verificar conflitos com agendamentos existentes
4. Verificar conflitos com bloqueios automáticos
5. Calcular score de prioridade:
   - Proximidade temporal ao horário original
   - Proximidade da data original
   - Score = 1000 - (diferença_tempo + diferença_dias * 60)
6. Ordenar por score e retornar top 5
```

### 3. **Algoritmo de Otimização de Agenda**
```typescript
1. Buscar todos os agendamentos do dia ordenados por horário
2. Para cada par de agendamentos consecutivos:
   - Calcular duração do serviço atual
   - Calcular horário de término
   - Calcular gap até próximo agendamento
   - Se gap > 30min, sugerir otimização
3. Propor novo horário com 15min de intervalo mínimo
4. Verificar conflitos com outros agendamentos
5. Calcular redução de gap e score de otimização
6. Atualizar campos de análise na tabela appointments
```

## Cron Jobs Configurados

### Vercel Cron Jobs
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "*/30 * * * *"  // Lembretes: 30min
    },
    {
      "path": "/api/cron/feedback", 
      "schedule": "0 */2 * * *"    // Feedback: 2h
    },
    {
      "path": "/api/cron/optimize",
      "schedule": "0 6 * * *"      // Otimização: 6h diárias
    }
  ]
}
```

## Fluxo de Otimização Automática

### 1. **Execução Diária (6h da manhã)**
```
1. Cron executa para todos os profissionais ativos
2. Cria bloqueios automáticos para o dia atual
3. Analisa agendamentos existentes
4. Gera sugestões de otimização
5. Atualiza scores e estatísticas
6. Retorna relatório de execução
```

### 2. **Execução Manual (via painel)**
```
1. Usuário seleciona data e profissional
2. Clica em "Bloquear Intervalos" ou "Otimizar Agenda"
3. Sistema executa algoritmos específicos
4. Exibe resultados em tempo real
5. Permite aplicar sugestões manualmente
```

## Métricas e KPIs

### Estatísticas Disponíveis
- **Agendamentos Analisados**: Quantidade processada
- **Gap Médio**: Tempo médio entre agendamentos
- **Score de Otimização**: Pontuação de eficiência
- **Gaps Totais**: Tempo total ocioso no dia
- **Reduções Sugeridas**: Minutos que podem ser economizados

### Benefícios Esperados
- **Redução de tempo ocioso**: Até 30-50% dos gaps
- **Melhor experiência do cliente**: Menos espera
- **Aumento de produtividade**: Mais agendamentos por dia
- **Automatização**: Menos trabalho manual de organização

## Próximas Melhorias

- [ ] Machine Learning para padrões de cancelamento
- [ ] Integração com calendários externos (Google, Outlook)
- [ ] Notificações push para sugestões de otimização
- [ ] Relatórios de eficiência por profissional
- [ ] Configurações avançadas de intervalos por tipo de serviço
- [ ] API para integração com outros sistemas