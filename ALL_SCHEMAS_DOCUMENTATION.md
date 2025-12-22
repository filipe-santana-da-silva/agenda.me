# 📚 Documentação de Schemas do Sistema

Aqui está a documentação de referência rápida para todos os schemas criados no sistema.

## 📊 Tabelas Criadas

### 1. **appointments** (Agendamentos)
- **Arquivo**: `db/agendamentos_schema.sql` (já existente)
- **Descrição**: Registra agendamentos de clientes para serviços
- **Campos principais**: appointment_date, appointment_time, customer_id, service_id, status
- **Status**: ✅ Em uso

### 2. **customers** (Clientes)
- **Arquivo**: `db/customers_schema.sql` (já existente)
- **Descrição**: Cadastro de clientes/pacientes
- **Campos principais**: name, phone
- **Documentação**: Veja código na página de Clientes
- **Status**: ✅ Em uso

### 3. **services** (Serviços)
- **Arquivo**: `db/services_schema.sql` (já existente)
- **Descrição**: Serviços disponíveis para agendamento
- **Campos principais**: name, duration (interval), price
- **Documentação**: Veja código na página de Serviços
- **Status**: ✅ Em uso

### 4. **categories** (Categorias de Produtos)
- **Arquivo**: `db/categories_schema.sql` (já existente)
- **Descrição**: Categorias para produtos/estoque
- **Campos principais**: name, description
- **Documentação**: Veja código na página de Produtos
- **Status**: ✅ Em uso

### 5. **products** (Produtos/Estoque)
- **Arquivo**: `db/products_schema.sql` (já existente)
- **Descrição**: Inventário e catálogo de produtos
- **Campos principais**: category_id, name, price, stock
- **Documentação**: Veja código na página de Produtos
- **Status**: ✅ Em uso

### 6. **profiles** (Perfil do Usuário)
- **Arquivo**: `db/profiles_schema.sql`
- **Descrição**: Informações de perfil do usuário
- **Campos principais**: email, name, phone, address, bio, avatar_url
- **Documentação**: `PROFILE_PAGE_README.md`
- **Status**: ✅ Em uso

### 7. **transactions** (Transações Financeiras) 🆕
- **Arquivo**: `db/transactions_schema.sql`
- **Documentação**: `TRANSACTIONS_SCHEMA.md` e `SETUP_FINANCEIRO.md`
- **Descrição**: Receitas e despesas
- **Campos principais**: type (income/expense), category, amount, date, status
- **RLS**: Sim - usuário vê apenas suas transações
- **Status**: ⏳ Aguardando SQL executar no Supabase

### 8. **employees** (Funcionários) 🆕
- **Arquivo**: `db/employees_schema.sql`
- **Documentação**: `EMPLOYEES_SCHEMA.md`
- **Descrição**: Cadastro e administração de funcionários
- **Campos principais**: name, email, cpf, position, department, hire_date, salary, status
- **RLS**: Sim - apenas usuários autenticados
- **Status**: ⏳ Aguardando SQL executar no Supabase

### 9. **reminders** (Lembretes) 🆕
- **Arquivo**: `db/reminders_schema.sql`
- **Documentação**: `REMINDERS_SCHEMA.md` e `SETUP_REMINDERS.md`
- **Descrição**: Lembretes/notas rápidas
- **Campos principais**: description, user_id
- **RLS**: Sim - usuário vê apenas seus lembretes
- **Status**: ⏳ Aguardando SQL executar no Supabase

## 🗂️ Estrutura de Arquivos

```
db/
├── agendamentos_schema.sql
├── customers_schema.sql
├── services_schema.sql
├── categories_schema.sql
├── products_schema.sql
├── profiles_schema.sql
├── transactions_schema.sql
├── employees_schema.sql
├── reminders_schema.sql
└── migrations/

DOCUMENTAÇÃO/
├── PROFILE_PAGE_README.md
├── TRANSACTIONS_SCHEMA.md
├── EMPLOYEES_SCHEMA.md
├── REMINDERS_SCHEMA.md
├── SETUP_FINANCEIRO.md
├── SETUP_REMINDERS.md
└── ALL_SCHEMAS_DOCUMENTATION.md (este arquivo)
```

## 🚀 Como Configurar Novos Schemas

Para cada novo schema, você precisa:

1. **Executar o SQL no Supabase:**
   - SQL Editor → New Query
   - Cole o conteúdo do arquivo `.sql`
   - Clique em Run

2. **Validar a Criação:**
   - Databases → Tables
   - Procure pela tabela na lista
   - Confirme os campos

## 📋 Checklist de Setup Completo

### Schemas Já Criados ✅
- [x] appointments
- [x] customers
- [x] services
- [x] categories
- [x] products
- [x] profiles

### Schemas Pendentes de SQL ⏳
- [ ] transactions (Execute `db/transactions_schema.sql`)
- [ ] employees (Execute `db/employees_schema.sql`)
- [ ] reminders (Execute `db/reminders_schema.sql`)

## 🔗 Relacionamentos entre Tabelas

```
auth.users
├── profiles (1:1)
├── appointments (1:N)
├── customers (não direto, por appointment)
├── transactions (1:N)
├── employees (sem relação, apenas acesso autenticado)
└── reminders (1:N)

customers
└── appointments (1:N)

services
└── appointments (1:N)

categories
└── products (1:N)

transactions (independente, filtrado por user_id)
employees (independente, filtrado por access control)
reminders (1:N com users)
```

## 🔒 Segurança em Todos os Schemas

Todos os schemas implementam:
- ✅ Row Level Security (RLS)
- ✅ Políticas de acesso por usuário
- ✅ Criptografia de dados sensíveis (onde aplicável)
- ✅ Validação de entrada
- ✅ Índices para performance

## 📈 Performance

Todos os schemas têm:
- ✅ Índices nas colunas mais consultadas
- ✅ Triggers para auto-update de `updated_at`
- ✅ Queries otimizadas

## 📚 Documentação Disponível

| Schema | Documentação | Setup |
|--------|--------------|-------|
| transactions | `TRANSACTIONS_SCHEMA.md` | `SETUP_FINANCEIRO.md` |
| employees | `EMPLOYEES_SCHEMA.md` | Inline no arquivo |
| reminders | `REMINDERS_SCHEMA.md` | `SETUP_REMINDERS.md` |
| profiles | `PROFILE_PAGE_README.md` | Inline no arquivo |

## 🎯 Próximas Etapas

1. Execute o SQL para os 3 schemas pendentes
2. Valide a criação das tabelas
3. Teste a criação de registros em cada página
4. Monitore performance com grandes volumes

## 💡 Dicas

- Todos os IDs usam UUID para distribuição uniforme
- Timestamps usam timezone awareness (`TIMESTAMP WITH TIME ZONE`)
- Campos booleanos usam TEXT com CHECK constraints
- Valores monetários usam NUMERIC(12,2) para precisão
- Descrições são TEXT (sem limite de tamanho)
