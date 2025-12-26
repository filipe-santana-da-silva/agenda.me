# Guia Avançado de CI/CD - Testes, Coverage e Monitoramento

## 1. Adicionar Testes Unitários

### Setup Inicial

```bash
# Instalar Jest e dependências
npm install --save-dev jest @testing-library/react @testing-library/jest-dom ts-jest @types/jest
```

### Configurar Jest (jest.config.js)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### Arquivo de Setup (jest.setup.js)

```javascript
import '@testing-library/jest-dom'
```

### Adicionar scripts ao package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Exemplo de Teste Unitário

Criar arquivo: `app/private/servicos/_components/__tests__/services-page-client.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { ServicesPageClient } from '../services-page-client'

// Mock do Supabase
jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [
            { id: '1', name: 'Corte', duration: '00:30:00', price: 5000 }
          ],
          error: null
        })
      })
    })
  })
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}))

describe('ServicesPageClient', () => {
  it('should load services on mount', async () => {
    render(<ServicesPageClient />)
    
    await waitFor(() => {
      expect(screen.getByText('Serviços')).toBeInTheDocument()
    })
  })
})
```

### Workflow para Testes (tests.yml)

Criar arquivo: `.github/workflows/tests.yml`

```yaml
name: Unit Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage --maxWorkers=2

      - name: Upload coverage reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/
          retention-days: 30
```

---

## 2. E2E Testing com Playwright

### Setup Inicial

```bash
# Instalar Playwright
npm install --save-dev @playwright/test
# Gerar arquivo de configuração
npx playwright install
```

### Configurar Playwright (playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'e2e-results.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Exemplo de Teste E2E

Criar arquivo: `e2e/services.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Services Page', () => {
  test('should load and display services', async ({ page }) => {
    await page.goto('/private/servicos')
    
    // Esperar pela tabela de serviços
    await expect(page.locator('text=Serviços')).toBeVisible()
    
    // Verificar se há um botão de adicionar
    const addButton = page.locator('button:has-text("Adicionar Serviço")')
    await expect(addButton).toBeVisible()
  })

  test('should open service dialog when clicking add', async ({ page }) => {
    await page.goto('/private/servicos')
    
    // Clicar no botão de adicionar
    await page.click('button:has-text("Adicionar Serviço")')
    
    // Verificar se dialog abriu
    await expect(page.locator('text=Novo Serviço')).toBeVisible()
  })
})
```

### Adicionar script ao package.json

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:debug": "playwright test --debug"
  }
}
```

### Workflow E2E (.github/workflows/e2e.yml)

```yaml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  e2e:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build project
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

      - name: Run E2E tests
        run: npm run e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## 3. Coverage Reporting com Codecov

### Setup Inicial

```bash
# Instalar Codecov
npm install --save-dev codecov
```

### Configurar package.json

```json
{
  "scripts": {
    "test:coverage": "jest --coverage --collectCoverageFrom='app/**/*.{ts,tsx}' --collectCoverageFrom='!app/**/*.d.ts'"
  }
}
```

### Workflow com Codecov (.github/workflows/coverage.yml)

```yaml
name: Coverage Report

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  coverage:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false
```

### Badge de Coverage no README

Adicionar ao seu README.md:

```markdown
[![codecov](https://codecov.io/gh/seu-usuario/seu-repo/branch/main/graph/badge.svg)](https://codecov.io/gh/seu-usuario/seu-repo)
```

---

## 4. Notificações no Slack/Discord

### Notificações no Slack

Workflow para notificar no Slack (.github/workflows/notify-slack.yml):

```yaml
name: Slack Notification

on:
  workflow_run:
    workflows: [ "Build & Test", "E2E Tests", "Deploy to Production" ]
    types: [ completed ]

jobs:
  notify:
    runs-on: ubuntu-latest
    
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Workflow: ${{ github.workflow }}
            Branch: ${{ github.ref_name }}
            Commit: ${{ github.event.head_commit.message }}
            Author: ${{ github.actor }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          fields: repo,message,commit,author,action
        if: always()
```

### Notificações no Discord

Adicionar ao seu workflow:

```yaml
- name: Discord notification
  uses: sarisia/actions-status-discord@v1
  if: always()
  with:
    webhook_url: ${{ secrets.DISCORD_WEBHOOK }}
    status: ${{ job.status }}
    title: "Build Status"
    description: |
      ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

### Adicionar Secrets

1. Vá para `Settings` → `Secrets and variables` → `Actions`
2. Adicione:
   - `SLACK_WEBHOOK`: URL do webhook do Slack
   - `DISCORD_WEBHOOK`: URL do webhook do Discord

---

## 5. Performance Monitoring com Lighthouse CI

### Setup Inicial

```bash
# Instalar Lighthouse CI
npm install --save-dev @lhci/cli@0.9.x @lhci/server
```

### Configurar Lighthouse (lighthouserc.json)

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/private/servicos",
        "http://localhost:3000/booking"
      ],
      "staticDistDir": "./.next/standalone",
      "settings": {
        "configPath": "./lighthouse-config.js"
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.8 }],
        "categories:seo": ["error", { "minScore": 0.8 }]
      }
    }
  }
}
```

### Arquivo de Configuração (lighthouse-config.js)

```javascript
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
  },
}
```

### Workflow Lighthouse (.github/workflows/lighthouse.yml)

```yaml
name: Lighthouse CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
          temporaryPublicStorage: true
          runs: 3
```

### Badge de Performance

Adicionar ao README.md:

```markdown
[![Lighthouse](https://img.shields.io/badge/Lighthouse-Check-green)](https://github.com/seu-usuario/seu-repo/actions)
```

---

## Resumo de Implementação

| Feature | Tempo | Complexidade | Prioridade |
|---------|-------|--------------|-----------|
| Testes Unitários | 2-3h | Média | Alta |
| E2E Tests | 3-4h | Alta | Alta |
| Coverage Codecov | 1h | Baixa | Média |
| Notificações | 30min | Baixa | Baixa |
| Lighthouse | 1-2h | Média | Média |

---

## Próximos Passos

1. **Iniciar com testes unitários** - Base sólida
2. **Adicionar E2E tests** - Cobertura de fluxos críticos
3. **Integrar Codecov** - Rastrear cobertura
4. **Setup notificações** - Melhor comunicação do time
5. **Lighthouse CI** - Monitorar performance

---

**Documentação criada em**: 26 de dezembro de 2025
