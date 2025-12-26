# CI/CD Pipeline Documentation

## Overview

O projeto possui um pipeline de CI/CD completo automatizado usando GitHub Actions. Ele garante qualidade de código, segurança e deployment automático.

## Workflows Inclusos

### 1. **Build & Test** (`build-test.yml`)
- **Acionado por**: Push em `main`/`develop` e Pull Requests
- **O que faz**:
  - Testa em Node.js 18.x e 20.x
  - Instala dependências
  - Executa linter (ESLint)
  - Faz build do projeto Next.js
  - Faz upload dos artefatos de build

**Caso de uso**: Garantir que o código compila e passa nas validações básicas

---

### 2. **Deploy Production** (`deploy-production.yml`)
- **Acionado por**: Push em `main` ou manualmente via `workflow_dispatch`
- **O que faz**:
  - Faz build do projeto
  - Faz deploy automático na Vercel em produção
  - Notifica sucesso/falha

**Caso de uso**: Deploy automático quando código entra em `main`

---

### 3. **Deploy Preview** (`deploy-preview.yml`)
- **Acionado por**: Push em `develop` ou Pull Requests
- **O que faz**:
  - Faz build do projeto
  - Faz deploy em preview/staging na Vercel
  - Gera URLs de preview

**Caso de uso**: Visualizar mudanças antes de mergear em `main`

---

### 4. **Code Quality** (`code-quality.yml`)
- **Acionado por**: Push em `main`/`develop` e Pull Requests
- **O que faz**:
  - Executa ESLint com relatório
  - Verifica tipos TypeScript
  - Executa `npm audit` para vulnerabilidades
  - Faz upload de relatórios

**Caso de uso**: Manter padrões de código e detectar problemas

---

### 5. **Security Checks** (`security.yml`)
- **Acionado por**: Push em `main`/`develop`, PRs e diariamente às 2 AM
- **O que faz**:
  - Executa `npm audit` em produção
  - Verifica dependências com Snyk (opcional)
  - Busca por secrets expostos com TruffleHog

**Caso de uso**: Detectar vulnerabilidades e secrets expostos

---

### 6. **Performance Tests** (`performance.yml`)
- **Acionado por**: Push em `main`/`develop` e Pull Requests
- **O que faz**:
  - Faz build otimizado
  - Analisa tamanho do bundle
  - Gera relatórios de performance

**Caso de uso**: Monitorar e evitar aumentos desnecessários de bundle size

---

## Configuração de Secrets Necessários

Para que o CI/CD funcione completamente, configure os seguintes secrets no repositório:
 
```
NEXT_PUBLIC_SUPABASE_URL        # URL do Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Chave anônima Supabase
STRIPE_SECRET_KEY               # Chave secreta Stripe
STRIPE_PUBLISHABLE_KEY          # Chave pública Stripe
OPENAI_API_KEY                  # Chave da API OpenAI
VERCEL_TOKEN                    # Token de autenticação Vercel
VERCEL_ORG_ID                   # ID da organização Vercel
VERCEL_PROJECT_ID               # ID do projeto Vercel
SNYK_TOKEN                      # Token Snyk (opcional)
KEEP_ALIVE_URL                  # URL para keep-alive Supabase
```

### Como adicionar secrets:
1. Acesse `Settings` → `Secrets and variables` → `Actions`
2. Clique em `New repository secret`
3. Adicione cada secret com seu valor

---

## Fluxo de Desenvolvimento

### Para desenvolver uma feature:
```bash
1. Criar branch a partir de develop:
   git checkout -b feature/minha-feature develop

2. Fazer commits e push:
   git push origin feature/minha-feature

3. Abrir Pull Request em develop
   - Workflow de build e testes executa automaticamente
   - Deploy preview gerado na Vercel
   - Revisar mudanças no preview

4. Após aprovação, mergear em develop
   - Deploy preview atualizado

5. Quando pronto para produção, mergear develop → main
   - Build final executa
   - Deploy automático em produção
```

---

## Status dos Workflows

Você pode visualizar o status de todos os workflows em:
`GitHub` → `Actions`

Cada workflow mostra:
- ✅ Status (Passing/Failing)
- ⏱️ Tempo de execução
- 📊 Logs detalhados
- 📦 Artefatos salvos

---

## Otimizações Implementadas

1. **Caching de dependências**: npm dependencies são cacheadas entre execuções
2. **Matrix testing**: Testa em múltiplas versões do Node.js simultaneamente
3. **Selective uploads**: Apenas artefatos bem-sucedidos são salvos
4. **Continue on error**: Alguns passos não bloqueiam o workflow se falharem
5. **Retenção de artefatos**: Relatórios mantidos por 30 dias

---

## Troubleshooting

### Build falha com erro de variáveis de ambiente
- Verifique se todos os secrets foram configurados
- Confirme que os nomes dos secrets estão corretos

### Deploy em produção não funciona
- Verifique `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`
- Certifique-se de estar usando a branch `main`

### ESLint falhando
- Execute localmente: `npm run lint`
- Corrija os erros antes de fazer push
- Use `eslint --fix` para correção automática

### Testes com Snyk falhando
- Configure token Snyk ou remova o step do workflow
- Ou corrija as vulnerabilidades encontradas

---

## Próximos Passos Recomendados

1. **Adicionar testes unitários**: `npm test` no workflow
2. **E2E testing**: Adicionar Playwright ou Cypress
3. **Coverage reporting**: Integrar Codecov
4. **Notificações**: Slack, Discord integrations
5. **Performance monitoring**: Integrar Lighthouse CI

---

**Documentação criada em**: 26 de dezembro de 2025
