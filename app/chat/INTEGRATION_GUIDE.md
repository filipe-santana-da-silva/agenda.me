# Guia de Integração - Refatora page.tsx

## 📋 Checklist de Integração

- [ ] 1. Adicionar imports dos hooks
- [ ] 2. Adicionar imports dos modals
- [ ] 3. Adicionar imports de types
- [ ] 4. Remover states duplicados do page.tsx
- [ ] 5. Substituir lógica por hooks
- [ ] 6. Substituir modal JSX por componentes
- [ ] 7. Testar fluxo completo
- [ ] 8. Validar responsividade
- [ ] 9. Limpar código antigo
- [ ] 10. Documentar mudanças

---

## 🔧 Passo 1: Imports

Adicione no topo de `page.tsx`:

```tsx
"use client";

import { useChat, useAppointment } from "./hooks";
import {
  MenuModal,
  CategoriesModal,
  ServicesModal,
  DateModal,
  ProfessionalsModal,
  CheckoutModal,
  SuccessModal,
  PasswordModal,
  ViewServicesModal,
  ViewProfessionalsModal,
} from "./components/modals";
import { STATIC_SERVICES, STATIC_PROFESSIONALS } from "./constants";
import type { Service, Professional } from "./types";
```

---

## 🔧 Passo 2: Estado

Remova estes states de `page.tsx`:

```tsx
// ❌ REMOVER (substituído pelos hooks)
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [input, setInput] = useState<string>("");
const [bookingUser, setBookingUser] = useState<BookingUser | null>(null);
const [customerId, setCustomerId] = useState<string>("");

const [appointment, setAppointment] = useState<AppointmentData>({...});
const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
const [selectedService, setSelectedService] = useState<Service | null>(null);
const [selectedProfessional, setProfessional] = useState<Professional | null>(null);
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const [successMessage, setSuccessMessage] = useState<string>("");
```

Substitua por:

```tsx
// ✅ USAR HOOKS
const {
  messages,
  input,
  setInput,
  sendMessage,
  bookingUser,
  customerId,
} = useChat();

const {
  appointment,
  appointmentData,
  selectedService,
  selectedProfessional,
  selectedCategory,
  successMessage,
  // ... outras propriedades do hook
} = useAppointment();
```

---

## 🔧 Passo 3: Modal State

Remova:

```tsx
// ❌ REMOVER
const [showMenuModal, setShowMenuModal] = useState(true);
const [showCategoriesModal, setShowCategoriesModal] = useState(false);
const [showServicesModal, setShowServicesModal] = useState(false);
const [showDateModal, setShowDateModal] = useState(false);
const [showCheckoutModal, setShowCheckoutModal] = useState(false);
const [showProfessionalsModal, setShowProfessionalsModal] = useState(false);
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [showPasswordModal, setShowPasswordModal] = useState(false);
const [showViewServicesModal, setShowViewServicesModal] = useState(false);
const [showViewProfessionalsModal, setShowViewProfessionalsModal] = useState(false);
const [showSideModal, setShowSideModal] = useState(false);
```

Substitua por:

```tsx
// ✅ USAR STATE LOCAL PARA MODALS
const [modalState, setModalState] = useState({
  showMenuModal: true,
  showCategoriesModal: false,
  showServicesModal: false,
  showDateModal: false,
  showCheckoutModal: false,
  showProfessionalsModal: false,
  showSuccessModal: false,
  showPasswordModal: false,
  showViewServicesModal: false,
  showViewProfessionalsModal: false,
  showSideModal: false,
});

// Ou ainda melhor - use um context para estado de modals
```

---

## 🔧 Passo 4: Substituir Modal JSX

### Antes (❌ 200+ linhas de JSX no page.tsx):
```tsx
{showMenuModal && (
  <div className="fixed inset-0...">
    {/* Menu JSX enorme */}
  </div>
)}
```

### Depois (✅ 1 linha):
```tsx
<MenuModal
  isOpen={modalState.showMenuModal}
  onMenuOption={handleMenuOption}
  onPush={handlePush}
/>
```

---

## 🎯 Estrutura Final do page.tsx

```tsx
"use client";

import { useState } from "react";
import { useChat, useAppointment } from "./hooks";
import {
  MenuModal,
  CategoriesModal,
  // ... outros modals
} from "./components/modals";
import { STATIC_SERVICES, STATIC_PROFESSIONALS } from "./constants";

export default function ChatPage() {
  // ✅ Usar hooks para estado principal
  const { messages, input, setInput, sendMessage } = useChat();
  const { appointment, selectedService, ...appointmentState } = useAppointment();

  // Estado local dos modals
  const [modals, setModals] = useState({
    menu: true,
    categories: false,
    // ...
  });

  // Handlers
  const handleMenuOption = (optionId: string) => {
    // Lógica de navegação
  };

  const handleServiceSelect = (service: Service) => {
    // Lógica de seleção
  };

  // ... outros handlers

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b...">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      {/* Modals */}
      <MenuModal
        isOpen={modals.menu}
        onMenuOption={handleMenuOption}
        onPush={handlePush}
      />
      <CategoriesModal
        isOpen={modals.categories}
        services={STATIC_SERVICES}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        onClose={() => setModals({ ...modals, categories: false })}
        onBack={() => setModals({ ...modals, categories: false, menu: true })}
      />
      {/* ... outros modals */}

      {/* Input */}
      <div className="bg-muted fixed bottom-0 left-0 right-0 p-5">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem"
            className="flex-1 bg-background rounded-full px-4 py-3"
          />
          <button type="submit" className="rounded-full">
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 📊 Redução de Código

| Arquivo | Antes | Depois | Redução |
|---------|-------|--------|---------|
| page.tsx | 2168 | ~400 | 81% |
| hooks/useChat.ts | 0 | 80 | +80 |
| hooks/useAppointment.ts | 0 | 150 | +150 |
| components/modals/*.tsx | 0 | ~2000 | +2000 |
| **TOTAL** | 2168 | 2630 | Mais organizado |

---

## 🧪 Testes

### 1. Fluxo de Agendamento
- [ ] Menu → Categorias → Serviços → Profissionais → Data/Hora → Checkout → Sucesso

### 2. Mensagens de Chat
- [ ] Enviar mensagem
- [ ] Mensagem aparece na lista
- [ ] localStorage atualiza

### 3. Seleções
- [ ] Selecionar categoria
- [ ] Selecionar serviço
- [ ] Selecionar data/hora
- [ ] Selecionar profissional

### 4. Responsividade
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### 5. Edge Cases
- [ ] Data no passado (não selecionável)
- [ ] Sem profissionais
- [ ] Sem serviços

---

## 🔗 Dependências Entre Módulos

```
page.tsx
├── useChat hook
│   ├── ChatMessage type
│   ├── BookingUser type
│   └── supabase client
├── useAppointment hook
│   ├── AppointmentData type
│   ├── AppointmentState type
│   ├── Service type
│   └── Professional type
└── Modal Components
    ├── MenuModal
    ├── CategoriesModal
    ├── ServicesModal
    ├── DateModal
    ├── ProfessionalsModal
    ├── CheckoutModal
    ├── SuccessModal
    ├── PasswordModal
    ├── ViewServicesModal
    └── ViewProfessionalsModal

STATIC_SERVICES & STATIC_PROFESSIONALS
├── Service type
├── Professional type
└── Used by multiple modals
```

---

## 💡 Dicas Importantes

1. **Estado de Modals**: Considere usar Context API ou Zustand para estado de modals
2. **Callbacks**: Use callbacks das props para comunicação pai-filho
3. **localStorage**: Verificar sincronização após refatoração
4. **Tipos**: Manter tipos TypeScript para cada prop
5. **Testes**: Testar cada modal isoladamente antes da integração final

---

## 📞 Troubleshooting

### Problema: Hooks não encontram estado compartilhado
**Solução**: Certifique-se de que `useChat` e `useAppointment` estão atualizando o estado corretamente

### Problema: Modals não abrem/fecham
**Solução**: Verificar estado dos modals (`modalState`) e callbacks das props

### Problema: localStorage não sincroniza
**Solução**: Validar `useEffect` em `useChat` está rodando

### Problema: Imports circulares
**Solução**: Manter tipos em `types.ts` separado de implementação

---

**Próximo Passo**: Começar a refatorar page.tsx seguindo este guia
