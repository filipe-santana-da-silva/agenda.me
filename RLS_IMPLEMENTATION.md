# Row Level Security (RLS) Implementation Guide

## Overview
Row Level Security (RLS) foi ativado no Supabase para proteger dados em nível de linha do banco de dados.

## Changes Made

### 1. Database Policies (`supabase/policies/rls_policies.sql`)
Políticas de RLS foram criadas para as seguintes tabelas:
- **Appointment**: Users veem apenas seus próprios agendamentos (userid) ou agendamentos que criaram
- **Reminder**: Users veem apenas seus próprios lembretes
- **RankingEventDetail**: Users veem apenas ranking de agendamentos que possuem
- **AppointmentRequestedRecreator**: Users veem apenas recreators solicitados para seus agendamentos

### 2. API Endpoints Updated

#### `/api/clinic/appointments/color`
**Antes**: Usava SERVICE_ROLE_KEY (admin bypass)
**Depois**: 
- Usa cliente autenticado do servidor
- Valida que o usuário possui o agendamento
- RLS automaticamente filtra linhas não autorizadas
- Retorna erro 403 se usuário não tiver permissão

```typescript
// Verificação de ownership antes de atualizar
const { data: appointment } = await supabase
  .from('Appointment')
  .select('id, userid')
  .eq('id', id)
  .single()

if (appointment.userid !== user.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

#### `/api/appointments/ranking`
**Antes**: Usava SERVICE_ROLE_KEY sem validar propriedade do appointment
**Depois**:
- Valida ownership do appointment antes de operações
- Mantém SERVICE_ROLE_KEY apenas para operações internas de sistema
- Retorna erro 403 se usuário não tiver permissão

### 3. Server Actions Updated

#### `deleteAppointment` (delete-appointment.ts)
**Mudanças**:
- Nome da tabela corrigido: `appointments` → `Appointment`
- Adicionado verificação adicional de ownership antes de deletar
- Usa `.eq('userid', userData.user.id)` para garantir row-level matching
- RLS aplicará filtro automaticamente

## How RLS Works

Com RLS ativado, o Supabase aplica automaticamente as políticas em cada query:

1. **SELECT**: Retorna apenas linhas que o usuário tem permissão de ver
2. **INSERT**: Bloqueia se a política não permite
3. **UPDATE**: Bloqueia se a política não permite
4. **DELETE**: Bloqueia se a política não permite

### Exemplo de Query com RLS
```typescript
// Usuário A consultando appointments
const { data } = await supabase
  .from('Appointment')
  .select('*')

// RLS automaticamente filtra para:
// WHERE userid = auth.uid() OR created_by = auth.jwt()->>'email'
// Usuário A só vê seus próprios agendamentos
```

## Security Implications

✅ **Melhorias de Segurança**:
- Dados são protegidos em nível de banco de dados (não apenas aplicação)
- Mesmo se alguém acessar o banco diretamente, RLS protege dados
- Eliminado risco de SERVICE_ROLE_KEY ser exposto desnecessariamente
- Users não conseguem acessar dados de outros users

⚠️ **Considerações**:
- SERVICE_ROLE_KEY ainda é necessário para operações administrativas
- CLIENT/ANON_KEY agora é mais restritivo (apenas dados do usuário)
- Alguns endpoints que antes funcionavam podem retornar 403 se o usuário não tem permission

## Deployment Steps

1. **Executar SQL de RLS**:
   ```sql
   -- Execute o arquivo supabase/policies/rls_policies.sql no seu Supabase Console
   ```

2. **Verificar no Supabase Dashboard**:
   - Ir para "Authentication" > "Policies"
   - Confirmar que policies estão aplicadas em cada tabela

3. **Deploy do código**:
   ```bash
   npm run build  # Verify build succeeds
   npm run dev    # ou deploy para produção
   ```

4. **Testar**:
   - Fazer login como usuário diferente
   - Verificar que vê apenas seus próprios agendamentos
   - Tentar acessar agendamento de outro usuário (deve falhar)

## Troubleshooting

### Erro: "new row violates row-level security policy"
- Verifique se a política permite INSERT
- Certifique-se que userid está sendo setado corretamente

### Erro: "permission denied for schema public"
- Verifique se o anon_key tem permissões suficientes
- Pode ser necessário ajustar políticas de seleção

### Queries retornam vazio quando esperado dados
- RLS pode estar filtrando mais do que o esperado
- Verifique as condições da política na tabela

## Tabelas sem RLS (por design)

As seguintes tabelas permanem sem RLS pois são compartilhadas ou públicas:
- `Recreator` - Listagem pública de recreators
- `Contractor` - Listagem pública de contratantes
- `role` - Roles do sistema
- `user_permission` - Gerenciado apenas por ADMIN

Se precisar proteger estas tabelas, adicione políticas similares às criadas para Appointment.

## Referências

- Supabase RLS Docs: https://supabase.com/docs/learn/auth-deep-dive/row-level-security
- PostgreSQL RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
