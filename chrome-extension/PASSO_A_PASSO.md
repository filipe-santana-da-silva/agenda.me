# 📱 Guia Passo a Passo - Enviar Catálogo pelo WhatsApp

## ✅ Fluxo Correto de "Enviar 📱"

### Pré-requisito
- ✅ WhatsApp Web já aberto em uma aba (https://web.whatsapp.com)
- ✅ Estar logado no WhatsApp Web
- ✅ Extensão carregada em chrome://extensions

### Passo 1: Clique em "Enviar 📱"
Na extensão, clique no botão verde **"Enviar 📱"** de um catálogo

**O que acontece:**
- A aba do WhatsApp Web é ativada automaticamente
- Um overlay (janela) aparece com a mensagem: "Escolha o contato"
- Console do WhatsApp mostra: `📤 Enviando mensagem para WhatsApp Web...`
- Console do WhatsApp mostra: `💬 Abrindo funcionalidade de envio no WhatsApp...`

### Passo 2: Feche o Overlay (ou aguarde)
Clique em **"Entendi! Vou escolher um contato"** no overlay

**O que acontece:**
- O overlay desaparece
- Um botão roxo aparece no canto inferior direito: **"📤 Enviar Catálogo"**
- Console mostra: `👤 Fechando overlay, mostrando botão flutuante`
- Console mostra: `✅ Criando novo botão flutuante`

### Passo 3: Escolha o Contato
No WhatsApp Web, clique em um contato ou grupo

**O que você vê:**
- A caixa de mensagem muda (mostra o contato selecionado)
- O botão "📤 Enviar Catálogo" continua visível no canto

### Passo 4: Clique no Botão "📤 Enviar Catálogo"
Clique no botão roxo que apareceu

**O que acontece:**
- A mensagem do catálogo é **carregada** na caixa de mensagem do WhatsApp
- O botão desaparece
- Console mostra: `✅ Carregando catálogo no input de mensagem...`
- Console mostra: `✅ Mensagem carregada no input! Clique em Enviar no WhatsApp para confirmar.`

### Passo 5: Envie a Mensagem no WhatsApp
Clique no botão de envio (seta ➡️) no WhatsApp

**Pronto!** A mensagem foi enviada com os detalhes do catálogo.

---

## 🎨 Fluxo Alternativo de "Arrastar 🔄"

### Passo 1: Clique em "Arrastar 🔄"
Na extensão, clique no botão azul **"Arrastar 🔄"** de um catálogo

**O que acontece:**
- A aba do WhatsApp Web é ativada
- Um card (cartão) arrastável aparece no centro da tela
- Mostra: Nome do catálogo, descrição, itens e preços

### Passo 2: Arraste o Card (opcional)
Clique no cabeçalho azul e arraste o card para a posição desejada

### Passo 3: Clique em "Enviar pelo WhatsApp ✓"
No card, clique no botão verde

**O que acontece:**
- O mesmo fluxo de seleção de contato inicia
- Overlay: "Escolha o contato"
- Botão flutuante: "📤 Enviar Catálogo"

### Passo 4-5: Escolha Contato e Envie
Mesmos passos do fluxo "Enviar 📱"

---

## 🐛 Troubleshooting

### ❌ Problema: Nada acontece quando clico em "Enviar 📱"

**Verificar:**
1. Abra F12 (DevTools) → Console da Extensão
2. Procure por logs que começam com 📱 ou 📤
3. Verifique no Console do WhatsApp Web também

**Possíveis causas:**
- WhatsApp não está aberto
- Content Script não carregou no WhatsApp
- Há um erro de comunicação

**Solução:**
- Recarregue a extensão: chrome://extensions → Recarregar
- Feche e abra o WhatsApp Web novamente
- Verifique os logs do console

### ❌ Problema: Overlay aparece mas botão não funciona

**Verificar:**
1. Clique no botão "📤 Enviar Catálogo"
2. Abra F12 → Console do WhatsApp
3. Procure por: `🖱️ Clicado botão flutuante`

**Se não aparecer:** O clique não está sendo registrado
- Tente clicar novamente
- Verifique se o botão está visível

**Se aparecer com erro:** Mensagem de "Nenhum catálogo para enviar"
- Recarregue a extensão
- Clique novamente em "Enviar 📱"

### ❌ Problema: Mensagem não aparece no WhatsApp

**Verificar:**
1. Console do WhatsApp: `📨 Mensagem recebida:`
2. Console do WhatsApp: `✅ Input de mensagem encontrado`
3. Console do WhatsApp: `⏳ Tentando Enter para enviar...`

**Possível causa:** O seletor do campo de texto mudou
- Aguarde por atualizações da extensão

---

## 📊 Logs Importantes

### Extensão (Popup)
```
📱 Procurando aba do WhatsApp Web...
✅ WhatsApp Web encontrado, aba ID: 123
📤 Enviando mensagem para WhatsApp Web...
✅ Mensagem enviada ao content script
```

### WhatsApp Web (Content Script)
```
✅ Content Script carregado na página
📨 Mensagem recebida: {action: "sendCatalogMessage"}
💬 Abrindo funcionalidade de envio no WhatsApp...
🎯 Mostrando overlay de seleção de contato
👤 Fechando overlay, mostrando botão flutuante
✅ Criando novo botão flutuante
✅ Botão flutuante adicionado ao DOM
🖱️ Clicado botão flutuante
✅ Carregando catálogo no input de mensagem...
✅ Input encontrado, carregando mensagem...
✅ Mensagem carregada no input! Clique em Enviar no WhatsApp para confirmar.
```

---

## 📋 Checklist de Funcionamento

- [ ] Extensão instalada e habilitada
- [ ] Logado no WhatsApp Web
- [ ] Catálogos aparecem na extensão
- [ ] Clico em "Enviar 📱" → WhatsApp ativa
- [ ] Overlay "Escolha o contato" aparece
- [ ] Botão "📤 Enviar Catálogo" aparece após fechar overlay
- [ ] Escolho um contato no WhatsApp
- [ ] Clico no botão roxo
- [ ] Mensagem aparece na caixa de texto do WhatsApp
- [ ] Clico em enviar no WhatsApp

**Se todos os itens estão marcados: ✅ TUDO FUNCIONANDO!**

---

## 📞 Versão
v1.0.18

Última atualização: Dezembro 3, 2025
