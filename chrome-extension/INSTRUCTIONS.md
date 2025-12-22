# Recreart Catálogos - Instruções de Teste

## Pré-requisitos
1. **WhatsApp Web já aberto**: Abra https://web.whatsapp.com em uma aba do navegador ANTES de usar a extensão
2. **Next.js rodando**: A API deve estar rodando em http://localhost:3000

## Fluxo Correto

### Para "Enviar 📱" (Novo Fluxo com Botão Flutuante)

1. ✅ Abra o WhatsApp Web (https://web.whatsapp.com) em uma aba
2. ✅ Clique em "Enviar 📱" em um catálogo na extensão
3. ✅ A aba do WhatsApp será ativada automaticamente
4. ✅ Um overlay aparecerá: "Escolha o contato"
5. ✅ Clique em um contato/grupo no WhatsApp
6. ✅ Um botão flutuante "📤 Enviar Catálogo" aparecerá no canto inferior direito
7. ✅ Clique nele para injetar a mensagem
8. ✅ Clique em "Enviar" no WhatsApp para enviar

### Para "Arrastar 🔄" (Drag & Drop)

1. ✅ Abra o WhatsApp Web (https://web.whatsapp.com) em uma aba
2. ✅ Clique em "Arrastar 🔄" em um catálogo na extensão
3. ✅ A aba do WhatsApp será ativada
4. ✅ Um card arrastável aparecerá no centro da tela
5. ✅ Você pode arrastar, visualizar os itens e clicar em "Enviar pelo WhatsApp ✓"

## Troubleshooting

### ❌ "Por favor, abra o WhatsApp Web em uma aba primeiro!"
- **Problema**: WhatsApp não está aberto
- **Solução**: Abra https://web.whatsapp.com em uma aba

### ❌ Overlay aparece mas botão não funciona
- **Verificar**: F12 → Console → Procure por "✅ Botão enviado ao content script"
- **Se não aparecer**: Pode haver um erro de comunicação entre a extensão e a aba do WhatsApp

### ❌ Mensagem não aparece no WhatsApp
- **Verificar**: F12 → Console do WhatsApp Web → Procure por logs da extensão
- **Pode ser**: O seletor do campo de texto do WhatsApp mudou

## Logs Importantes

Abra o console (F12) para ver logs:

**Na Extensão (Popup)**:
- `📱 Procurando aba do WhatsApp Web...`
- `✅ WhatsApp Web encontrado, aba ID: XXX`
- `📤 Enviando mensagem para WhatsApp Web...`
- `✅ Mensagem enviada ao content script`

**No WhatsApp Web (Content Script)**:
- `✅ Content Script carregado na página`
- `📨 Mensagem recebida: sendCatalogMessage`
- `💬 Abrindo funcionalidade de envio no WhatsApp...`
- `📤 Clicado botão de enviar catálogo`

## Versão Atual
v1.0.16
