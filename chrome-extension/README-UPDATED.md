# 🚀 Extensão Chrome - Recreart Catálogos

## Sobre
Extensão que permite compartilhar catálogos criados no dashboard Recreart diretamente pelo WhatsApp Web com drag-and-drop.

## Funcionalidades

### ✅ Autenticação
- Login com email e senha (integração com Supabase)
- Armazenamento seguro de token na extensão
- Sessão persistente
- Logout seguro

### ✅ Gerenciamento de Catálogos
- Sincronização de catálogos do dashboard
- Visualização de itens no card
- Atualização em tempo real
- Cache local para performance

### ✅ Drag and Drop
- Arrastar catálogos pela tela
- Criar múltiplos cards de um mesmo catálogo
- Cards móveis que podem ser posicionados livremente
- Suporte a arrastar em qualquer página

### ✅ Integração WhatsApp Web
- Enviar catálogo completo como mensagem formatada
- Envio direto do popup (abre conversa no WhatsApp Web)
- Formatação elegante com emojis e destaque

## Estrutura de Arquivos

```
chrome-extension/
├── manifest.json        # Configuração da extensão
├── popup.html          # Interface do popup
├── popup.js            # Lógica de autenticação e catálogos
├── styles.css          # Estilos
├── background.js       # Service Worker
├── content.js          # Script de conteúdo (WhatsApp Web)
├── config.js           # Configurações
├── debug.js            # Ferramentas de debug
├── README.md           # Este arquivo
└── INSTALLATION.md     # Guia de instalação
```

## Como Instalar

1. Abra `chrome://extensions/` no Chrome
2. Ative "Modo de desenvolvedor" (canto superior direito)
3. Clique em "Carregar extensão sem empacotamento"
4. Selecione a pasta `chrome-extension`

## Como Usar

### Fazer Login
```
1. Clique no ícone da extensão
2. Digite seu email Recreart
3. Digite sua senha
4. Clique em "Entrar"
```

### Ver Catálogos
```
1. Após login bem-sucedido
2. Os catálogos aparecem automaticamente
3. Cada card mostra nome, descrição e itens
```

### Enviar pelo WhatsApp
```
1. Clique em "Enviar 📱"
2. Uma aba do WhatsApp Web abre
3. Selecione um contato
4. Envie a mensagem
```

### Modo Arrastar
```
1. Clique em "Arrastar 🔄"
2. Solte o catálogo em qualquer página
3. Um card móvel aparece na tela
4. Arraste para repositonar
5. Clique "X" para remover
```

### Fazer Logout
```
1. Clique no ícone de logout (X) no header
2. Você retorna à tela de login
```

## 🔧 Solução de Problemas

### Erro: "Resposta inválida do servidor"
Este erro significa que o servidor está retornando HTML em vez de JSON. Possíveis causas:
- Servidor offline ou em manutenção
- Problema no deploy do Vercel
- Rede/firewall bloqueando requisições

**Solução:**
```javascript
// Abra o console (F12) na aba da extensão e execute:
testLogin()
```

### Erro: "Email ou senha inválidos"
Significa que as credenciais estão incorretas.

**Solução:**
- Verifique o email
- Verifique a senha
- Tente fazer login no dashboard primeiro

### Erro: "Nenhum token foi retornado"
Significa que o servidor retornou sucesso mas sem token.

**Solução:**
- Verifique se o endpoint `/api/auth/login` existe no servidor
- Verifique os logs do servidor

### WhatsApp Web não abre
O WhatsApp Web pode estar bloqueado por firewall ou não estar disponível na região.

**Solução:**
- Tente abrir manualmente: `https://web.whatsapp.com`
- Verifique se consegue acessar antes de usar a extensão

## 🧪 Ferramentas de Debug

### Ativar Debug
1. Abra o console da extensão (F12)
2. Execute um dos comandos abaixo:

```javascript
// Testar login
testLogin()

// Testar carregamento de catálogos (precisa de token)
testCatalogs('seu-token-aqui')
```

### Verificar Storage Local
```javascript
// Ver dados armazenados
chrome.storage.local.get(null, (items) => console.log(items))

// Limpar dados
chrome.storage.local.clear()
```

## 📋 Requisitos

- Google Chrome versão 88+
- Conta Recreart ativa
- Conexão com internet
- WhatsApp Web para enviar mensagens

## 🔐 Informações de Segurança

### Dados Armazenados
- ✅ Email (obrigatório)
- ✅ Token de autenticação (criptografado pelo Chrome)

### Dados NÃO Armazenados
- ❌ Senha (nunca é salva)
- ❌ Dados de clientes
- ❌ Informações de pagamento

### Boas Práticas
1. Faça logout ao usar computador compartilhado
2. Não compartilhe suas credenciais
3. Atualize senha regularmente
4. Mantenha a extensão atualizada

## 🔄 Sincronizar Catálogos

A extensão sincroniza automaticamente ao fazer login. Para sincronizar manualmente:

1. Clique no botão circular ↻ no header
2. Os catálogos serão recarregados
3. Mudanças feitas no dashboard aparecerão

## 📝 Histórico de Versões

- **v1.0.0** (03/12/2025): Lançamento inicial
  - Autenticação com Supabase
  - Carregamento de catálogos
  - Envio via WhatsApp Web
  - Modo drag-and-drop
  - Ferramentas de debug

## 🆘 Suporte

Se tiver problemas não resolvidos:

1. Verifique este README
2. Ative o modo debug (F12)
3. Tente em uma aba privada/incógnito
4. Desinstale e reinstale a extensão
5. Limpe o cache do navegador
