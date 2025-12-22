# Sistema RBAC - Role Based Access Control

Este documento explica como funciona o sistema de permissões baseado em papéis (RBAC) implementado no dashboard.

## Estrutura do Sistema

### Papéis (Roles)

O sistema possui dois papéis principais:

1. **ADMIN (Administrador)**
   - Acesso completo ao sistema
   - Pode gerenciar usuários e permissões
   - Acesso a todas as páginas

2. **FUNCIONARIO (Funcionário)**
   - Acesso limitado às operações básicas
   - Não pode gerenciar usuários
   - Acesso apenas às páginas operacionais

### Permissões por Papel

#### ADMIN tem acesso a:
- ✅ Agendamentos
- ✅ Clientes
- ✅ Serviços
- ✅ Produtos
- ✅ Catálogos
- ✅ Financeiro
- ✅ Funcionários
- ✅ Permissões
- ✅ Meu Perfil

#### FUNCIONARIO tem acesso a:
- ✅ Agendamentos
- ✅ Clientes
- ✅ Serviços
- ✅ Produtos
- ✅ Catálogos
- ❌ Financeiro
- ❌ Funcionários
- ❌ Permissões
- ✅ Meu Perfil

## Como Usar

### 1. Acessar a Página de Permissões

- Faça login como ADMIN
- Navegue para **Configurações > Permissões**
- A página só é visível para usuários com papel ADMIN

### 2. Criar Novo Usuário

1. Clique no botão **"Novo Usuário"**
2. Preencha os campos:
   - **Nome**: Nome completo do usuário
   - **Email**: Email único para login
   - **Senha**: Senha temporária (usuário deve alterar no primeiro login)
   - **Papel**: Selecione ADMIN ou FUNCIONARIO
3. Clique em **"Criar Usuário"**

### 3. Gerenciar Usuários Existentes

- **Ativar/Desativar**: Clique no ícone de olho para ativar/desativar um usuário
- **Excluir**: Clique no ícone de lixeira para excluir permanentemente
- **Visualizar**: Veja informações como papel, status e data de criação

## Implementação Técnica

### Arquivos Principais

1. **`/types/permissions.ts`**: Define tipos e constantes de permissões
2. **`/utils/hooks/usePermissions.ts`**: Hook para verificar permissões
3. **`/components/PermissionGuard.tsx`**: Componente para proteger rotas
4. **`/app/private/permissoes/page.tsx`**: Página de gerenciamento
5. **`/app/api/users/route.ts`**: API para CRUD de usuários
6. **`/db/rbac_schema.sql`**: Schema do banco de dados

### Banco de Dados

A tabela `system_users` armazena:
- `id`: UUID único
- `email`: Email único para login
- `name`: Nome do usuário
- `password_hash`: Hash bcrypt da senha
- `role`: ADMIN ou FUNCIONARIO
- `is_active`: Status ativo/inativo
- `created_at/updated_at`: Timestamps
- `created_by`: Referência ao usuário que criou

### Segurança

- **RLS (Row Level Security)**: Implementado no Supabase
- **Hash de Senhas**: Usando bcryptjs
- **Validação de Permissões**: Em todas as rotas protegidas
- **Middleware**: Verificação automática de acesso

## Configuração Inicial

### 1. Executar Migration

```sql
-- Execute o arquivo db/rbac_schema.sql no seu banco Supabase
```

### 2. Usuário Admin Padrão

O sistema cria automaticamente um usuário admin:
- **Email**: admin@agenda.me
- **Senha**: admin123
- **Papel**: ADMIN

⚠️ **IMPORTANTE**: Altere a senha padrão após o primeiro login!

### 3. Configurar Autenticação

Certifique-se de que o contexto de autenticação (`AuthContext`) está configurado para incluir o papel do usuário.

## Extensibilidade

### Adicionar Nova Permissão

1. Adicione a nova página em `PagePermission` (types/permissions.ts)
2. Atualize `ROLE_PERMISSIONS` com as permissões apropriadas
3. Adicione o item no menu da sidebar
4. Proteja a rota com `PermissionGuard`

### Adicionar Novo Papel

1. Adicione o novo papel em `UserRole`
2. Defina suas permissões em `ROLE_PERMISSIONS`
3. Adicione o label em `ROLE_LABELS`
4. Atualize as validações no banco de dados

## Troubleshooting

### Usuário não consegue acessar página
- Verifique se o papel está correto
- Confirme se a permissão está definida em `ROLE_PERMISSIONS`
- Verifique se o usuário está ativo

### Erro ao criar usuário
- Verifique se o email já existe
- Confirme se o usuário atual é ADMIN
- Verifique conexão com banco de dados

### Sidebar não mostra itens
- Verifique se `usePermissions` está funcionando
- Confirme se o contexto de autenticação inclui o papel
- Verifique se as permissões estão corretas