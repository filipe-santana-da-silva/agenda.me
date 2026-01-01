# 📋 Checklist de Deployment: Lembretes v2.0

**Data:** Janeiro 1, 2026  
**Versão:** 2.0  
**Tiempo estimado:** 15 minutos

---

## ✅ PRÉ-DEPLOYMENT

### Preparação
- [ ] Leia [REMINDERS_QUICK_START.md](REMINDERS_QUICK_START.md)
- [ ] Backup do banco de dados
- [ ] Ambiente de teste disponível
- [ ] Acesso ao Supabase

### Validação de Código
- [ ] Arquivos modificados estão corretos
- [ ] Imports estão corretos
- [ ] Sem erros de compilação
- [ ] Console sem warnings

---

## 🚀 DEPLOYMENT

### 1️⃣ Executar SQL (5 min)

**Passo a passo:**
```
1. Acesse: https://supabase.com/
2. Vá ao seu projeto
3. Clique: SQL Editor → + New Query
4. Cole: Conteúdo de db/reminders_schema.sql
5. Clique: Run (ou Ctrl+Enter)
6. Verifique: Mensagem de sucesso (sem erros em vermelho)
```

**Validação:**
```sql
-- Execute para validar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reminders' 
ORDER BY ordinal_position;
```

**Deve mostrar:**
- ✅ id (uuid)
- ✅ user_id (uuid)
- ✅ description (text)
- ✅ **appointment_id (uuid)** ← NOVO
- ✅ created_at (timestamp)
- ✅ updated_at (timestamp)

---

### 2️⃣ Recarregar Aplicação (2 min)

```
1. Parar servidor (Ctrl+C)
2. Limpar cache:
   - rm -rf .next
   - rm -rf node_modules/.cache
3. Reiniciar servidor
4. Ou apenas fazer Ctrl+Shift+R no navegador
```

---

### 3️⃣ Testar a Feature (5 min)

#### Teste 1: Lembrete SEM Agendamento
```
1. Acesse: http://localhost:3000/private/agenda
2. Clique: + (botão em Lembretes)
3. Preencha: "Teste sem agendamento"
4. Deixe: "Sem agendamento" selecionado
5. Clique: Cadastrar lembrete
6. Resultado: ✅ Toast "Sucesso!" + lembrete apareça
```

#### Teste 2: Lembrete COM Agendamento
```
1. Clique: + novamente
2. Preencha: "Teste com agendamento"
3. Selecione: Um agendamento do dropdown
4. Clique: Cadastrar lembrete
5. Resultado: ✅ Lembrete com dados do agendamento
              ✅ Mostra: data, hora, cliente, serviço
```

#### Teste 3: Deletar
```
1. Hover: Um lembrete
2. Clique: Ícone de lixeira
3. Confirme: Exclusão
4. Resultado: ✅ Lembrete removido
              ✅ Toast de confirmação
```

#### Teste 4: Mobile
```
1. Abra DevTools (F12)
2. Clique: Responsive Design Mode (Ctrl+Shift+M)
3. Selecione: iPhone 12 Pro
4. Teste: Criar, visualizar, deletar lembrete
5. Resultado: ✅ UI responsiva funciona
```

---

## ✨ VALIDAÇÃO FINAL

### Verificação Técnica
- [ ] Sem erros no console (F12)
- [ ] Supabase logs sem erros
- [ ] Network requests HTTP 200
- [ ] Database queries corretas

### Verificação Funcional
- [ ] Dropdown carrega corretamente
- [ ] Lembrete salva com appointment_id
- [ ] Dados do agendamento aparecem
- [ ] Delete funciona sem erros
- [ ] Mobile responsivo

### Verificação de Dados
```sql
-- Verifique se os dados foram salvos
SELECT * FROM reminders 
WHERE user_id = 'seu-user-id' 
ORDER BY created_at DESC 
LIMIT 5;
```

**Deve mostrar:**
```
id              | user_id | description | appointment_id | created_at
──────────────────────────────────────────────────────────────────────
uuid-123        | uuid-456| Teste...    | null           | 2024-01-01...
uuid-789        | uuid-456| Teste COM...| uuid-apt-999   | 2024-01-01...
```

---

## 📊 PERFORMANCE CHECK

### Índices Criados
```sql
-- Verifique se os índices existem
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'reminders';
```

**Deve mostrar:**
- ✅ idx_reminders_user_id
- ✅ idx_reminders_appointment_id ← NOVO
- ✅ idx_reminders_created_at

### Query Performance
```sql
-- Teste a query de leitura (deve ser rápido)
EXPLAIN ANALYZE
SELECT r.* 
FROM reminders r 
LEFT JOIN appointments a ON r.appointment_id = a.id 
LEFT JOIN customers c ON a.customer_id = c.id 
LEFT JOIN services s ON a.service_id = s.id 
WHERE r.user_id = 'seu-user-id' 
ORDER BY r.created_at DESC;
```

**Deve estar abaixo de 10ms** ✅

---

## 🔐 SEGURANÇA CHECK

### RLS Policies
```sql
-- Verifique as policies
SELECT policyname, qual, with_check 
FROM pg_policies 
WHERE tablename = 'reminders';
```

**Deve ter:**
- ✅ Users can view their own reminders
- ✅ Users can insert their own reminders
- ✅ Users can update their own reminders
- ✅ Users can delete their own reminders

### Test RLS
```
1. Faça logout
2. Faça login com usuário diferente
3. Verifique: Não vê lembretes de outro usuário ✅
4. Crie um lembrete: Vê apenas o seu ✅
```

---

## 🐛 TROUBLESHOOTING RÁPIDO

### Problema: Dropdown vazio
**Solução:**
1. Verifique se tem agendamentos com status 'scheduled'
2. Acesse Supabase → appointments table
3. Procure por `status = 'scheduled'`
4. Se não tiver, crie um agendamento de teste

### Problema: Erro "relation 'appointments' does not exist"
**Solução:**
1. Execute `db/agendamentos_schema.sql` primeiro
2. Verifique se a tabela `appointments` existe
3. Acesse Supabase → Tables

### Problema: Dados do agendamento não aparecem
**Solução:**
1. Recarregue a página (Ctrl+F5)
2. Verifique console (F12) para erros
3. Limpe cache do navegador
4. Execute SQL de validação novamente

### Problema: "permission denied"
**Solução:**
1. Verifique se você está logado
2. Faça logout e login novamente
3. Verifique token JWT no Supabase
4. Tente em modo anônimo

---

## ✅ CHECKLIST POS-DEPLOYMENT

### Documentação
- [ ] Documentação dentro de `REMINDERS_*.md` está acessível
- [ ] Team documentado sobre mudanças
- [ ] Changelog atualizado

### Monitoramento
- [ ] Monitore erros em tempo real
- [ ] Verifique Sentry/logging
- [ ] Observar feedback de usuários

### Próximas Steps
- [ ] Colete feedback do time
- [ ] Documente issues encontrados
- [ ] Planeje v2.1 (edição de lembretes)

---

## 🎯 ROLLBACK (Se Necessário)

**Se algo deu muito errado:**

```sql
-- Remove a coluna (volta ao estado anterior)
ALTER TABLE reminders 
DROP COLUMN IF EXISTS appointment_id;

-- Remove o índice
DROP INDEX IF EXISTS idx_reminders_appointment_id;
```

**Nota:** Isso remove toda a funcionalidade nova, mas lembretes antigos permanecem intactos.

---

## 📞 SUPORTE DURANTE DEPLOYMENT

### Se encontrar erro:

1. **Verifique console (F12)**
   - Procure por mensagens em vermelho
   - Note o erro exato

2. **Consulte Supabase**
   - Vá para: Logs → Function Editor
   - Procure por erros relacionados

3. **Leia documentação**
   - [SETUP_REMINDERS_UPDATE.md](SETUP_REMINDERS_UPDATE.md) - SQL issues
   - [REMINDERS_QUICK_START.md](REMINDERS_QUICK_START.md) - Feature issues

4. **Procure por erro aqui**
   - [SETUP_REMINDERS_UPDATE.md#-se-houver-erro](SETUP_REMINDERS_UPDATE.md#-se-houver-erro)

---

## ✨ FINAL CHECKLIST

```
PRÉ-DEPLOYMENT:
☐ Backup feito
☐ Documentação lida
☐ Ambiente preparado

DEPLOYMENT:
☐ SQL executado
☐ Validação de schema OK
☐ Aplicação recarregada
☐ Testes feitos (4 testes básicos)
☐ Mobile testado

PÓS-DEPLOYMENT:
☐ Dados no banco salvos corretamente
☐ Índices criados
☐ RLS policies funcionando
☐ Performance OK (<10ms)
☐ Segurança validada
☐ Documentação acessível
☐ Time informado
```

---

## 🎉 PARABÉNS!

Se todos os checkboxes estão marcados, você implementou com sucesso:

✅ **Sistema de Lembretes v2.0**  
✅ **Linkagem com Agendamentos**  
✅ **Documentação Completa**  
✅ **Pronto para Produção**

---

**Tempo total:** ~15 minutos  
**Complexidade:** ⭐ Baixa  
**Risco:** ⭐ Muito Baixo (não-destrutivo)

**Próximo passo:** Comunicar ao time e cooletar feedback!

---

**Criado:** Janeiro 1, 2026  
**Versão:** 2.0  
**Status:** 🟢 Pronto
