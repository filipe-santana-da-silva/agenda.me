# Sistema de Avaliações e Badges

## Funcionalidades Implementadas

### 1. **Feedback Pós-Atendimento via Email**
- **Endpoint**: `/api/feedback/send`
- **Trigger**: Agendamentos com status `CONCLUIDO`
- **Email**: Template profissional com link de avaliação
- **Frequência**: Cron a cada 2 horas

### 2. **Página de Avaliação** (`/feedback/[token]`)
- **Avaliação por estrelas**: Geral, Qualidade, Pontualidade, Limpeza
- **Comentário opcional**
- **Checkbox "Recomendaria"**
- **Token seguro** com validade de 7 dias

### 3. **Sistema de Badges Automático**
Badges atribuídos automaticamente baseados em performance:

#### 🏆 **Badges Disponíveis**
- **⭐ Excelência em Atendimento**: Média geral ≥ 4.5
- **⏰ Sempre Pontual**: Pontualidade ≥ 4.5  
- **✨ Ambiente Impecável**: Limpeza ≥ 4.5
- **👥 Altamente Recomendado**: ≥ 90% recomendam

#### 📊 **Critérios para Badges**
- **Mínimo**: 5 avaliações
- **Recálculo**: A cada nova avaliação
- **Sem duplicatas**: Badge só é criado uma vez

### 4. **Dashboard de Satisfação** (`/private/avaliacoes`)
- **Estatísticas gerais**: Média, total, taxa de recomendação
- **Profissionais destacados**: Com badges e médias
- **Avaliações recentes**: Últimas 10 com detalhes
- **Design responsivo**

## Estrutura do Banco de Dados

### Tabela `reviews`
```sql
- id (SERIAL PRIMARY KEY)
- appointment_id (FK appointments)
- customer_id (FK customers) 
- professional_id (FK employees)
- rating (1-5) - Avaliação geral
- service_quality (1-5) - Qualidade do serviço
- punctuality (1-5) - Pontualidade
- cleanliness (1-5) - Limpeza
- comment (TEXT) - Comentário opcional
- would_recommend (BOOLEAN) - Recomendaria
- created_at, updated_at
```

### Tabela `professional_badges`
```sql
- id (SERIAL PRIMARY KEY)
- professional_id (FK employees)
- badge_type (VARCHAR) - Tipo do badge
- badge_name (VARCHAR) - Nome exibido
- badge_description (TEXT) - Descrição
- earned_at (TIMESTAMP) - Quando foi conquistado
- is_active (BOOLEAN) - Se está ativo
```

### Campos Adicionados em `appointments`
```sql
- feedback_sent (BOOLEAN) - Se email foi enviado
- feedback_completed (BOOLEAN) - Se cliente avaliou
- completed_at (TIMESTAMP) - Quando foi concluído
```

## Fluxo Completo

1. **Agendamento concluído** → `status = 'CONCLUIDO'`, `completed_at = NOW()`
2. **Cron executa** (2h) → Busca agendamentos sem feedback enviado
3. **Email enviado** → `feedback_sent = true`
4. **Cliente avalia** → Dados salvos em `reviews`
5. **Sistema verifica badges** → Atribui automaticamente se critérios atendidos
6. **Dashboard atualizado** → Estatísticas e badges em tempo real

## Configuração dos Crons

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
    }
  ]
}
```

## Template do Email de Feedback

- **Assunto**: "⭐ Como foi seu atendimento? Avalie nossa experiência!"
- **Conteúdo**: Dados do agendamento + botão de avaliação
- **Design**: Responsivo e profissional
- **CTA**: Botão laranja "⭐ Avaliar Atendimento"

## Próximas Melhorias

- [ ] Notificações push para profissionais
- [ ] Relatório de satisfação por período
- [ ] Badges personalizados por estabelecimento
- [ ] Integração com WhatsApp para feedback
- [ ] Sistema de metas e gamificação
- [ ] Análise de sentimento nos comentários