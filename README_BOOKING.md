# Sistema de Agendamentos (Bookings) - Adaptado para Supabase

Este sistema replica exatamente a funcionalidade e estilização do `fullstackweekend-aparatus-v2`, mas usando Supabase como banco de dados.

## 📋 Schema do Banco de Dados

O schema SQL está em `db/schema_aparatus.sql`. Execute este arquivo no Supabase SQL Editor para criar as tabelas necessárias:

- `user` - Usuários do sistema
- `barbershop` - Barbearias cadastradas
- `barbershop_service` - Serviços oferecidos pelas barbearias
- `booking` - Agendamentos dos usuários

## 🚀 Instalação

1. Execute o schema SQL no Supabase:
   ```sql
   -- Execute o arquivo db/schema_aparatus.sql no Supabase SQL Editor
   ```

2. Instale as dependências necessárias (se ainda não estiverem instaladas):
   ```bash
   npm install next-safe-action zod date-fns
   ```

## 📁 Estrutura de Arquivos

### Data Layer
- `data/bookings.ts` - Funções para buscar agendamentos do usuário

### Components
- `components/booking-item.tsx` - Item de agendamento na lista
- `components/booking-info-sheet.tsx` - Sheet com detalhes do agendamento
- `components/booking-summary.tsx` - Resumo do agendamento
- `components/header.tsx` - Header da aplicação
- `components/footer.tsx` - Footer da aplicação
- `components/menu-sheet.tsx` - Menu lateral
- `app/barbershops/[id]/_components/copy-button.tsx` - Botão para copiar telefone

### Actions
- `actions/cancel-booking.ts` - Action para cancelar agendamento

### Lib
- `lib/booking-status.ts` - Função para determinar status do agendamento
- `lib/action-client.ts` - Cliente de actions com autenticação
- `lib/utils.ts` - Utilitários (incluindo formatCurrency)

### Pages
- `app/booking/page.tsx` - Página principal de agendamentos

## 🔧 Funcionalidades

- ✅ Listar agendamentos confirmados e finalizados
- ✅ Visualizar detalhes do agendamento
- ✅ Cancelar agendamentos futuros
- ✅ Integração com Stripe para reembolsos (se aplicável)
- ✅ Autenticação via Supabase Auth
- ✅ Row Level Security (RLS) configurado

## 📝 Notas Importantes

1. **Autenticação**: O sistema usa Supabase Auth. Certifique-se de que o usuário está autenticado antes de acessar a página de agendamentos.

2. **RLS Policies**: As políticas de Row Level Security estão configuradas no schema SQL. Ajuste conforme necessário para seu caso de uso.

3. **Estrutura de Dados**: A estrutura replica exatamente o Prisma schema do `fullstackweekend-aparatus-v2`, mas adaptada para Supabase:
   - `imageUrl` → `image_url`
   - `priceInCents` → `price_in_cents`
   - `cancelledAt` → `cancelled_at`
   - etc.

4. **Conversão de Dados**: A função `getUserBookings` converte automaticamente os dados do Supabase para o formato esperado pelos componentes.

## 🎨 Estilização

A estilização é idêntica ao `fullstackweekend-aparatus-v2`, usando os mesmos componentes UI e classes Tailwind.

