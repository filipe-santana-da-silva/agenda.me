# Guia Rápido: Implementação de Testes e CI/CD Avançado

## 🚀 Começar com Testes Unitários

### 1. Instalar dependências

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom ts-jest @types/jest
```

### 2. Arquivos já criados

Você já tem:
- ✅ `jest.config.js` - Configuração do Jest
- ✅ `jest.setup.js` - Setup inicial
- ✅ `app/private/servicos/_components/__tests__/services-page-client.test.tsx` - Exemplo de teste
- ✅ `.github/workflows/tests.yml` - Workflow de CI/CD

### 3. Executar testes localmente

```bash
# Executar testes uma vez
npm test

# Executar testes em modo watch
npm test -- --watch

# Executar com cobertura
npm test -- --coverage
```

### 4. Adicionar ao package.json (se ainda não tiver)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 📋 Próximas Etapas Recomendadas

### 1️⃣ **E2E Testing com Playwright** (Recomendado depois de testes unitários)

```bash
npm install --save-dev @playwright/test
npx playwright install
```

Criar arquivo `.github/ADVANCED_CI_CD.md` contém o setup completo

### 2️⃣ **Coverage com Codecov** (Integração simples)

```bash
npm install --save-dev codecov
```

Adicionar secret no GitHub: `CODECOV_TOKEN`

### 3️⃣ **Notificações no Slack/Discord** (Opcional)

Criar secrets:
- `SLACK_WEBHOOK`
- `DISCORD_WEBHOOK`

### 4️⃣ **Performance com Lighthouse CI** (Monitoring contínuo)

```bash
npm install --save-dev @lhci/cli@0.9.x
```

---

## 📚 Documentação Completa

Veja o arquivo `.github/ADVANCED_CI_CD.md` para:
- ✅ Setup completo E2E Testing
- ✅ Integração Codecov
- ✅ Notificações Slack/Discord
- ✅ Lighthouse CI Setup
- ✅ Exemplos de código

---

## 🔧 Estrutura de Testes

```
app/
├── private/
│   ├── servicos/
│   │   ├── _components/
│   │   │   ├── services-page-client.tsx
│   │   │   ├── __tests__/
│   │   │   │   └── services-page-client.test.tsx ✅
```

### Convenção de nomes:
- `__tests__/` - Diretório de testes
- `*.test.tsx` ou `*.spec.tsx` - Arquivos de teste

---

## ✅ Workflow CI/CD Atual

O arquivo `.github/workflows/tests.yml` já está configurado para:

1. **Rodar testes** em cada push/PR
2. **Gerar relatório de cobertura**
3. **Fazer upload de artefatos** por 30 dias
4. **Comentar cobertura no PR** (automático)

---

## 💡 Exemplo: Adicionar Teste para Outro Componente

```typescript
// components/booking-item/__tests__/booking-item.test.tsx

import { render, screen } from '@testing-library/react'
import BookingItem from '../booking-item'

describe('BookingItem', () => {
  it('should display booking information', () => {
    const mockBooking = {
      id: '1',
      service_id: 'service-1',
      appointment_date: '2025-01-15',
      appointment_time: '10:00',
      status: 'confirmed'
    }

    render(<BookingItem booking={mockBooking} />)
    
    expect(screen.getByText(/2025-01-15/)).toBeInTheDocument()
  })
})
```

---

## 🎯 Checklist de Implementação

- [x] Jest configurado
- [x] Exemplo de teste criado
- [x] Workflow de testes criado
- [ ] Executar testes localmente e verificar
- [ ] Commitar para GitHub
- [ ] Verificar workflow rodando no GitHub Actions
- [ ] Adicionar mais testes para componentes críticos
- [ ] Integrar Codecov (próximo)
- [ ] Implementar E2E tests (próximo)

---

## 📞 Dúvidas Frequentes

### P: Como mockar o Supabase nos testes?
**R:** Veja o exemplo em `services-page-client.test.tsx` - use `jest.mock()`

### P: Como testar componentes que usam hooks?
**R:** Use `@testing-library/react` - renderize o componente e teste o comportamento

### P: Como verificar cobertura?
**R:** Execute `npm test -- --coverage` e abra `coverage/lcov-report/index.html`

---

**Última atualização**: 26 de dezembro de 2025
