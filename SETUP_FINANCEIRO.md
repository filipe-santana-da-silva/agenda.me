# 📋 Configuração do Módulo Financeiro

## ⚠️ Importante: Executar SQL no Supabase

Antes de usar o módulo financeiro, você precisa executar o script SQL para criar a tabela de transações.

### Passos:

1. **Acesse o Supabase Dashboard:**
   - Vá para https://supabase.com/
   - Faça login na sua conta
   - Clique no seu projeto

2. **Abra o SQL Editor:**
   - No menu esquerdo, clique em **SQL Editor**
   - Clique em **+ New Query**

3. **Cole o SQL Schema:**
   - Abra o arquivo `db/transactions_schema.sql`
   - Copie todo o conteúdo
   - Cole no editor SQL do Supabase

4. **Execute o Script:**
   - Clique em **Run** (ou `Ctrl + Enter`)
   - Verifique se não há erros (será exibido em vermelho se houver)
   - Se bem-sucedido, você verá uma mensagem verde

5. **Valide a Criação:**
   - No menu esquerdo, clique em **Databases** → **Tables**
   - Você deve ver a tabela `transactions` na lista
   - Clique nela para ver as colunas

## ✅ Pronto para Usar

Após executar o SQL, o módulo financeiro estará 100% funcional:

- ✅ Criar transações
- ✅ Editar transações
- ✅ Deletar transações
- ✅ Filtrar por período, tipo, status
- ✅ Buscar por descrição/categoria
- ✅ Ver dashboard com estatísticas

## 🔧 Campos da Transação

Ao criar uma transação, preencha:

- **Tipo**: Receita ou Despesa (obrigatório)
- **Categoria**: Selecione uma categoria pré-definida (obrigatório)
- **Descrição**: Texto descritivo (obrigatório, ex: "Venda produto X")
- **Valor (R$)**: Sempre positivo (obrigatório)
- **Data**: Data da transação (obrigatório)
- **Método de Pagamento**: PIX, Cartão, Dinheiro, etc. (opcional)
- **Status**: Pendente, Concluído ou Cancelado (padrão: Pendente)

## 📊 Categorias Disponíveis

### Receitas:
- Vendas
- Serviços
- Investimentos
- Bonificação
- Outro

### Despesas:
- Aluguel
- Utilitários
- Fornecedores
- Salário
- Marketing
- Transporte
- Alimentação
- Manutenção
- Outro

## 🐛 Troubleshooting

### "Erro ao criar transação"
**Solução**: Verifique se executou o SQL schema. A tabela `transactions` deve existir no banco.

### "Tabela não foi criada"
**Solução**: Copie o erro que aparece, abra um novo SQL query e execute:
```sql
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions');
```
Se retornar `false`, execute o schema completo novamente.

### "Erro de autenticação"
**Solução**: Certifique-se de estar logado na aplicação. Recarregue a página.

### Sem dados aparecem
**Solução**: As transações são filtradas por período. Tente:
1. Mudar o período para "Todos"
2. Criar algumas transações
3. Recarregar a página

## 📞 Suporte

Se continuar com problemas:
1. Verifique o console do navegador (F12 → Console)
2. Verifique o terminal do Next.js para erros
3. Confirme que está autenticado
4. Confirme que a tabela existe no Supabase
