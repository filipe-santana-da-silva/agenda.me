# Página de Controle Financeiro

## Visão Geral

A página de Controle Financeiro permite gerenciar receitas, despesas e transações da sua empresa em um único dashboard intuitivo. Você pode registrar, editar, excluir e filtrar transações com facilidade.

## Funcionalidades

### Dashboard de Estatísticas
- **Receitas**: Total de todas as receitas marcadas como concluídas
- **Despesas**: Total de todas as despesas marcadas como concluídas
- **Saldo**: Diferença entre receitas e despesas (receitas - despesas)
- **Pendente**: Total de transações ainda pendentes de conclusão

### Filtros e Busca
- **Tipo**: Filtrar por Receitas, Despesas ou todos os tipos
- **Status**: Filtrar por Pendente, Concluído ou Cancelado
- **Período**: Filtrar por Hoje, Esta semana, Este mês, Este ano ou todos os períodos
- **Busca**: Buscar por descrição ou categoria da transação

### Tabela de Transações
Exibe todas as transações com as seguintes informações:
- **Data**: Data da transação (formatada em dd/MM/yyyy)
- **Descrição**: Descrição da transação
- **Categoria**: Categoria da transação
- **Tipo**: Receita (verde) ou Despesa (vermelho)
- **Valor**: Valor em reais com indicador +/- conforme o tipo
- **Status**: Pendente (amarelo), Concluído (verde) ou Cancelado (vermelho)
- **Ações**: Botões para editar ou excluir

## Como Usar

### Criar Nova Transação
1. Clique no botão "Nova Transação" no topo da página
2. Preencha o formulário:
   - **Tipo**: Selecione se é Receita ou Despesa
   - **Categoria**: Escolha uma categoria apropriada
   - **Descrição**: Digite uma descrição clara da transação
   - **Valor**: Digite o valor em reais
   - **Data**: Selecione a data da transação
   - **Método de Pagamento**: Selecione o método (opcional)
   - **Status**: Marque como Pendente, Concluído ou Cancelado
3. Clique em "Criar" para salvar

### Editar Transação
1. Na tabela, clique no ícone de edição (lápis) na linha da transação
2. Modifique os dados desejados
3. Clique em "Atualizar" para salvar as alterações

### Excluir Transação
1. Na tabela, clique no ícone de lixeira (vermelho) na linha da transação
2. Confirme a exclusão na janela de confirmação
3. A transação será removida permanentemente

## Categorias Disponíveis

### Para Receitas
- Vendas
- Serviços
- Investimentos
- Bonificação
- Outro

### Para Despesas
- Aluguel
- Utilitários
- Fornecedores
- Salário
- Marketing
- Transporte
- Alimentação
- Manutenção
- Outro

## Métodos de Pagamento
- Dinheiro
- Cartão Débito
- Cartão Crédito
- PIX
- Boleto
- Transferência
- Outro

## Schema do Banco de Dados

A página utiliza a tabela `transactions` com a seguinte estrutura:

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Campos
- **id**: Identificador único (UUID)
- **user_id**: ID do usuário proprietário da transação
- **type**: Tipo de transação ('income' ou 'expense')
- **category**: Categoria da transação
- **description**: Descrição da transação
- **amount**: Valor da transação (positivo)
- **date**: Data da transação
- **payment_method**: Método de pagamento (opcional)
- **status**: Status da transação ('pending', 'completed' ou 'cancelled')
- **created_at**: Data/hora de criação
- **updated_at**: Data/hora da última atualização

### Índices
- `idx_transactions_user_id`: Para melhor performance nas queries do usuário
- `idx_transactions_date`: Para melhor performance nos filtros por data
- `idx_transactions_status`: Para melhor performance nos filtros por status
- `idx_transactions_type`: Para melhor performance nos filtros por tipo

### Row Level Security (RLS)
Todas as operações (SELECT, INSERT, UPDATE, DELETE) são protegidas por RLS:
- Usuários só podem visualizar suas próprias transações
- Usuários só podem criar transações para si mesmos
- Usuários só podem editar e deletar suas próprias transações

### Triggers
- `transactions_updated_at_trigger`: Atualiza automaticamente o campo `updated_at` sempre que um registro é modificado

## API Endpoints

### GET /api/financeiro/transactions
Recupera todas as transações do usuário autenticado.

**Query Parameters:**
- `dateRange`: Filtro de período ('all', 'today', 'week', 'month', 'year') - padrão: 'all'

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "income",
      "category": "Vendas",
      "description": "Venda de produto X",
      "amount": 100.00,
      "date": "2025-01-15",
      "payment_method": "PIX",
      "status": "completed",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/financeiro/transactions
Cria uma nova transação.

**Body:**
```json
{
  "type": "income",
  "category": "Vendas",
  "description": "Venda de produto X",
  "amount": 100.00,
  "date": "2025-01-15",
  "payment_method": "PIX",
  "status": "completed"
}
```

### PUT /api/financeiro/transactions/[id]
Atualiza uma transação existente.

**Body:** (mesmo formato do POST)

### DELETE /api/financeiro/transactions/[id]
Deleta uma transação.

## Segurança

- Todas as operações requerem autenticação via Supabase Auth
- Row Level Security garante que cada usuário acesse apenas seus dados
- Valores são validados no frontend e no banco de dados
- Transações são imutáveis após certos períodos (pode ser implementado)

## Dicas de Uso

1. **Manter Registros Atualizados**: Registre as transações o mais cedo possível para manter dados precisos
2. **Usar Categorias Consistentes**: Padronize o uso de categorias para melhor análise
3. **Revisar Regularmente**: Verifique o dashboard mensalmente para manter o controle
4. **Marcar como Concluído**: Altere o status para "Concluído" apenas quando a transação for efetivamente realizada
5. **Usar o Filtro de Períodos**: Analise dados por períodos para identificar tendências

## Limitações e Considerações

- Valores são armazenados com até 2 casas decimais
- Datas devem estar no formato ISO (YYYY-MM-DD)
- Não é possível criar transações com valor zero ou negativo
- Deletar uma transação é permanente e não pode ser desfeito
