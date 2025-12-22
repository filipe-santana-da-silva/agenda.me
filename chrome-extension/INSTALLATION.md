# 🚀 Guia de Instalação - Extensão Chrome Recreart Catálogos

## ⚡ Início Rápido

### 1. Preparar o Computador

```powershell
# Ter Google Chrome instalado (versão 88+)
# Abrir uma nova aba do Chrome
```

### 2. Carregar a Extensão

1. Abra `chrome://extensions/` (copie e cole na barra de endereço)
2. Ative o **"Modo de desenvolvedor"** (canto superior direito)
3. Clique em **"Carregar extensão sem empacotamento"**
4. Selecione a pasta: `c:\Users\Filip\OneDrive\Área de Trabalho\agenda\chrome-extension`

### 3. Validar Instalação

- ✅ Você deve ver o ícone da extensão na barra do Chrome
- ✅ O ícone mostra "Recreart Catálogos" ao passar o mouse
- ✅ Clicando no ícone abre o popup

## 📋 Uso da Extensão

### Fazer Login

```
1. Clique no ícone da extensão
2. Digite seu email
3. Digite sua senha
4. Clique em "Entrar"
```

### Ver Catálogos

```
1. Após login, clique em "Sincronizar" (ícone de seta circular)
2. Seus catálogos aparecem em cards
3. Cada card mostra:
   - Nome do catálogo
   - Descrição
   - Primeiros 3 itens
   - Quantidade de itens adicionais
```

### Enviar pelo WhatsApp

```
1. Localize o catálogo desejado
2. Clique em "Enviar 📱"
3. Uma aba do WhatsApp Web abre automaticamente
4. A mensagem é inserida no campo de texto
5. Você pode revisar antes de enviar
6. Selecione um contato e envie
```

### Modo Arrastar (Drag)

```
1. Clique em "Arrastar 🔄" em um catálogo
2. A tela muda para modo drag
3. Solte o catálogo em qualquer lugar da tela
4. Um card aparece onde você soltou
5. Pode arrastar o card pela tela
6. Clique no "X" para remover o card
```

## 🔐 Informações de Segurança

### Dados Armazenados Localmente

A extensão armazena **somente** no seu navegador:
- ✅ Email de login
- ✅ Token de autenticação (criptografado)
- ✅ ID do usuário
- ✅ Cache de catálogos

### Dados que NÃO são armazenados

- ❌ Sua senha (nunca é armazenada)
- ❌ Informações de cartão/pagamento
- ❌ Dados de clientes/agendamentos
- ❌ Histórico de navegação

### Boas Práticas

1. **Faça logout** ao usar computador compartilhado
2. **Não compartilhe** seu email/senha com ninguém
3. **Atualize** a senha regularmente
4. **Limpe o histórico** se necessário (dados da extensão permanecem)

## 🔧 Troubleshooting

### "Email ou senha inválidos"

```
❌ Verifique se o email está correto
❌ Verifique se a senha está correta
✅ Resete a senha no dashboard se necessário
```

### "Erro ao carregar catálogos"

```
❌ Verifique sua conexão com internet
❌ Tente sincronizar novamente
✅ Faça logout e login novamente
```

### WhatsApp Web não abre

```
❌ Verifique se o WhatsApp Web está disponível na sua região
❌ Tente abrir manualmente: https://web.whatsapp.com
✅ Escaneie o QR code se necessário
```

### Extensão não aparece

```
❌ Verifique se está em chrome://extensions/
❌ Verifique se "Modo de desenvolvedor" está ativo
✅ Tente recarregar a página (F5)
```

## 📱 Suporte ao Dispositivo

### Computador (Desktop) ✅
- Chrome no Windows: **Totalmente suportado**
- Chrome no Mac: **Totalmente suportado**
- Chrome no Linux: **Totalmente suportado**

### Smartphone/Tablet ❌
- Extensões Chrome não funcionam em mobile
- Use o app do Chrome normalmente

## 🌐 Requisitos de Conectividade

A extensão precisa acessar:

```
✅ https://recreart-agenda.vercel.app (API)
✅ https://hfggzfsvdrbzzojyjssx.supabase.co (Autenticação)
✅ https://web.whatsapp.com (WhatsApp Web)
```

Se algum desses endereços está bloqueado (firewall/VPN), a extensão não funcionará.

## 🆘 Entre em Contato

Se tiver dúvidas ou problemas não resolvidos:

1. Verifique este guia novamente
2. Abra o console (F12) e procure por mensagens de erro
3. Tente em uma aba privada/incógnito
4. Desinstale e reinstale a extensão

## 📝 Histórico de Versões

- **v1.0.0** (03/12/2025): Lançamento inicial
  - Autenticação com Supabase
  - Carregamento de catálogos
  - Envio via WhatsApp Web
  - Modo drag-and-drop
