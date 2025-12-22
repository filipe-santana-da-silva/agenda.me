# Extensão Chrome - Recreart Catálogos

## Sobre
Extensão que permite compartilhar catálogos criados no dashboard Recreart diretamente pelo WhatsApp Web com drag-and-drop.

## Funcionalidades

### ✅ Autenticação
- Login com email e senha (integração com Supabase)
- Armazenamento seguro de token na extensão
- Sessão persistente

### ✅ Gerenciamento de Catálogos
- Sincronização de catálogos do dashboard
- Visualização de itens no card
- Atualização em tempo real

### ✅ Drag and Drop
- Arrastar catálogos pela tela
- Criar múltiplos cards de um mesmo catálogo
- Cards móveis que podem ser posicionados livremente

### ✅ Integração WhatsApp Web
- Enviar catálogo completo como mensagem formatada
- Envio direto do popup (abre conversa no WhatsApp Web)
- Formatação elegante com emojis e destaque

## Estrutura de Arquivos

```
chrome-extension/
├── manifest.json        # Configuração da extensão
├── popup.html          # Interface do popup
├── popup.js            # Lógica do popup
├── styles.css          # Estilos
├── background.js       # Service Worker
├── content.js          # Script de conteúdo (WhatsApp Web)
└── README.md          # Este arquivo
```

## Como Instalar

1. Abra `chrome://extensions/` no Chrome
2. Ative "Modo de desenvolvedor" (canto superior direito)
3. Clique em "Carregar extensão sem empacotamento"
4. Selecione a pasta `chrome-extension`

## Como Usar

1. **Login**: Clique na extensão e faça login com suas credenciais Recreart
2. **Ver Catálogos**: Os catálogos aparecem assim que você faz login
3. **Enviar pelo WhatsApp**: Clique em "Enviar 📱" para abrir conversa no WhatsApp
4. **Arrastar Catálogo**: Clique em "Arrastar 🔄" para ativar drag-mode
5. **Soltar na Tela**: Solte em qualquer lugar para criar um card móvel

## Permissões Usadas

- `storage`: Armazenar token de autenticação
- `tabs`: Criar abas e enviar mensagens
- `activeTab`: Acessar aba ativa
- `scripting`: Executar scripts no WhatsApp Web

## Requisitos

- Google Chrome versão 88+
- Conta Recreart ativa
- WhatsApp Web (para envio de mensagens)

## Notas de Segurança

- O token é armazenado localmente no navegador
- Nunca compartilhe suas credenciais
- Faça logout ao usar em computadores compartilhados

## Desenvolvimento Futuro

- [ ] Seleção de itens específicos para enviar
- [ ] Customização de mensagens antes de enviar
- [ ] Histórico de envios
- [ ] Templates de mensagens
- [ ] Suporte a outras plataformas (Telegram, Signal)
