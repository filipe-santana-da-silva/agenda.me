# 🚀 START HERE - Lembretes v2.0

**Você tem 2 minutos?** Leia isto.  
**Tempo total para implementar:** 15 minutos

---

## ⚡ Em 3 Passos

### 1️⃣ Execute SQL (5 min)

Acesse Supabase → SQL Editor → New Query → Cole:

```sql
ALTER TABLE reminders
ADD COLUMN IF NOT EXISTS appointment_id UUID 
  REFERENCES appointments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reminders_appointment_id 
  ON reminders(appointment_id);
```

Clique **Run**. Pronto! ✅

### 2️⃣ Recarregue a Página (1 min)

```
Ctrl+F5 (ou Cmd+Shift+R no Mac)
```

### 3️⃣ Teste (5 min)

1. Acesse `/private/agenda`
2. Clique no **+** em Lembretes
3. Digite uma descrição
4. Selecione um agendamento (ou deixe "Sem agendamento")
5. Clique em "Cadastrar lembrete"

✅ **PRONTO!**

---

## 📚 Documentação

**Quer saber mais?**

| Quando | Arquivo | Tempo |
|--------|---------|-------|
| Agora | Você está lendo | 2 min |
| Próximo | [REMINDERS_QUICK_START.md](REMINDERS_QUICK_START.md) | 5 min |
| Depois | [REMINDERS_IMPROVEMENTS.md](REMINDERS_IMPROVEMENTS.md) | 20 min |

---

## 🎯 O Que Mudou

✅ Lembretes podem ser linkados a agendamentos  
✅ Mostra data, hora, cliente, serviço  
✅ Tudo é opcional (compatível com existentes)  

---

## ✨ Visuais

**Antes:**
```
✓ Preparar documentos
```

**Depois:**
```
✓ Preparar documentos
  📅 25/12/2024 às 14:30
  👤 João Silva
  💇 Corte de Cabelo
```

---

## 🐛 Algo Deu Errado?

1. Recarregue (Ctrl+F5)
2. Verifique console (F12)
3. Leia [SETUP_REMINDERS_UPDATE.md](SETUP_REMINDERS_UPDATE.md)

---

## 📋 Próximos Passos

- [ ] Execute SQL
- [ ] Teste a feature
- [ ] Leia [REMINDERS_QUICK_START.md](REMINDERS_QUICK_START.md)
- [ ] Divirta-se! 🎉

---

**Versão:** 2.0 | **Status:** ✅ Pronto | **Data:** Jan 1, 2026
