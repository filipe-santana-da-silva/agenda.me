# 📋 Configuração do Módulo Reminders (Lembretes)

## ⚠️ Importante: Executar SQL no Supabase

Antes de usar o módulo de lembretes, você precisa executar o script SQL para criar a tabela de reminders.

### Passos:

1. **Acesse o Supabase Dashboard:**
   - Vá para https://supabase.com/
   - Faça login na sua conta
   - Clique no seu projeto

2. **Abra o SQL Editor:**
   - No menu esquerdo, clique em **SQL Editor**
   - Clique em **+ New Query**

3. **Cole o SQL Schema:**
   - Abra o arquivo `db/reminders_schema.sql`
   - Copie todo o conteúdo
   - Cole no editor SQL do Supabase

4. **Execute o Script:**
   - Clique em **Run** (ou `Ctrl + Enter`)
   - Verifique se não há erros (será exibido em vermelho se houver)
   - Se bem-sucedido, você verá uma mensagem verde

5. **Valide a Criação:**
   - No menu esquerdo, clique em **Databases** → **Tables**
   - Você deve ver a tabela `reminders` na lista
   - Clique nela para ver as colunas

## ✅ Pronto para Usar

Após executar o SQL, o módulo de lembretes estará 100% funcional:

- ✅ Criar lembretes
- ✅ Visualizar lista de lembretes
- ✅ Deletar lembretes
- ✅ Auto-save dos lembretes

## 📝 Como Usar

### Criar um Novo Lembrete:
1. Clique no botão **+** na seção de "Lembretes"
2. Digite a descrição do lembrete
3. Clique em **Salvar**

### Ver Lembretes:
- Todos os seus lembretes aparecem na lista em tempo real
- Ordenados por data de criação (mais recentes primeiro)

### Deletar Lembrete:
- Clique no ícone de **lixeira** (🗑️) ao lado do lembrete
- Confirme a exclusão
- O lembrete será removido imediatamente

## 🗄️ Estrutura da Tabela

```
reminders
├── id (UUID) - Identificador único
├── user_id (UUID) - ID do usuário (vinculado)
├── description (TEXT) - Descrição do lembrete
├── created_at (TIMESTAMP) - Data de criação (automática)
└── updated_at (TIMESTAMP) - Data de atualização (automática)
```

## 🔒 Segurança

- Cada usuário só vê seus próprios lembretes
- Impossível acessar lembretes de outros usuários
- Row Level Security (RLS) ativo
- Autenticação obrigatória

## 🐛 Troubleshooting

### "Erro ao carregar lembretes"
**Solução**: Verifique se executou o SQL schema. A tabela `reminders` deve existir no banco.

### "Lembrete não aparece na lista"
**Solução**: 
1. Recarregue a página
2. Verifique se está autenticado
3. Confirme que a tabela foi criada

### "Erro ao deletar lembrete"
**Solução**: 
1. Recarregue a página
2. Tente novamente
3. Verifique o console (F12) para mais detalhes

### Sem permissão para acessar
**Solução**: Certifique-se de que está logado na aplicação

## 📊 Exemplos SQL

### Ver todos os seus lembretes
```sql
SELECT id, description, created_at
FROM reminders
WHERE user_id = 'seu-user-id'
ORDER BY created_at DESC;
```

### Contar lembretes
```sql
SELECT COUNT(*) as total
FROM reminders
WHERE user_id = 'seu-user-id';
```

### Deletar um lembrete
```sql
DELETE FROM reminders
WHERE id = 'lembrete-id';
```

## 📞 Suporte

Se continuar com problemas:
1. Verifique o console do navegador (F12 → Console)
2. Verifique o terminal do Next.js para erros
3. Confirme que está autenticado
4. Confirme que a tabela existe no Supabase
