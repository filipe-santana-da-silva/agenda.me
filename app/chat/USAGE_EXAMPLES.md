# 📚 Exemplos de Uso - Componentes e Hooks

## 🪝 Hook: useChat

### Exemplo de Uso

```tsx
import { useChat } from "./hooks";

export function ChatComponent() {
  const {
    messages,
    input,
    setInput,
    sendMessage,
    bookingUser,
    customerId,
  } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div>
      {/* Exibir mensagens */}
      {messages.map((msg) => (
        <div key={msg.id} className={msg.sender === "bot" ? "bot" : "user"}>
          {msg.text}
        </div>
      ))}

      {/* Input */}
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem"
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
```

---

## 🪝 Hook: useAppointment

### Exemplo de Uso

```tsx
import { useAppointment } from "./hooks";

export function AppointmentComponent() {
  const {
    appointment,
    selectedService,
    selectedProfessional,
    selectedCategory,
    appointmentData,
    successMessage,
    getCalendarDays,
    getAvailableTimes,
    groupServicesByCategory,
  } = useAppointment();

  return (
    <div>
      {/* Usar calendar days */}
      {getCalendarDays(new Date()).map((day) => (
        <button key={day} onClick={() => console.log(day)}>
          {day}
        </button>
      ))}

      {/* Usar horários disponíveis */}
      {getAvailableTimes().map((time) => (
        <button key={time}>{time}</button>
      ))}

      {/* Agrupar serviços por categoria */}
      {Object.entries(groupServicesByCategory(services)).map(
        ([category, items]) => (
          <div key={category}>
            <h3>{category}</h3>
            {items.map((service) => (
              <div key={service.id}>{service.name}</div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
```

---

## 🎨 Componente: MenuModal

### Exemplo de Uso

```tsx
import { MenuModal } from "./components/modals";

export function ChatPage() {
  const [isOpen, setIsOpen] = useState(true);

  const handleMenuOption = (optionId: string) => {
    switch (optionId) {
      case "schedule":
        console.log("Ir para agendamento");
        break;
      case "services":
        console.log("Ver serviços");
        break;
      case "professionals":
        console.log("Ver profissionais");
        break;
      case "back":
        setIsOpen(false);
        break;
    }
  };

  return (
    <MenuModal
      isOpen={isOpen}
      onMenuOption={handleMenuOption}
      onPush={(path) => console.log("Navigate to:", path)}
    />
  );
}
```

---

## 🎨 Componente: CategoriesModal

### Exemplo de Uso

```tsx
import { CategoriesModal } from "./components/modals";
import { STATIC_SERVICES } from "./constants";

export function CategoriesView() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <CategoriesModal
      isOpen={isOpen}
      services={STATIC_SERVICES}
      selectedCategory={selectedCategory}
      onCategorySelect={(category) => {
        setSelectedCategory(category);
        console.log("Categoria selecionada:", category);
      }}
      onClose={() => setIsOpen(false)}
      onBack={() => setIsOpen(false)}
    />
  );
}
```

---

## 🎨 Componente: ServicesModal

### Exemplo de Uso

```tsx
import { ServicesModal } from "./components/modals";
import { STATIC_SERVICES } from "./constants";
import type { Service } from "./types";

export function ServicesView() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const selectedCategory = "Cortes";

  return (
    <ServicesModal
      isOpen={isOpen}
      services={STATIC_SERVICES}
      selectedCategory={selectedCategory}
      selectedService={selectedService}
      onServiceSelect={(service) => {
        setSelectedService(service);
        console.log("Serviço selecionado:", service.name);
      }}
      onClose={() => setIsOpen(false)}
      onBack={() => setIsOpen(false)}
    />
  );
}
```

---

## 🎨 Componente: DateModal

### Exemplo de Uso

```tsx
import { DateModal } from "./components/modals";
import { useAppointment } from "./hooks";
import type { AppointmentData } from "./types";

export function DateView() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointment, setAppointment] = useState<AppointmentData>({
    service_id: "1",
    professional_id: "1",
    appointment_date: "",
    appointment_time: "",
  });

  const { getCalendarDays, getAvailableTimes } = useAppointment();

  return (
    <DateModal
      isOpen={isOpen}
      currentMonth={currentMonth}
      appointment={appointment}
      selectedService={selectedService}
      selectedProfessional={selectedProfessional}
      getCalendarDays={getCalendarDays}
      getAvailableTimes={getAvailableTimes}
      onCurrentMonthChange={setCurrentMonth}
      onDateSelect={(date) => {
        setAppointment((prev) => ({
          ...prev,
          appointment_date: date,
        }));
      }}
      onTimeSelect={(time) => {
        setAppointment((prev) => ({
          ...prev,
          appointment_time: time,
        }));
      }}
      onClose={() => setIsOpen(false)}
      onBack={() => setIsOpen(false)}
      onNext={() => {
        console.log("Ir para próximo passo");
        setIsOpen(false);
      }}
    />
  );
}
```

---

## 🎨 Componente: ProfessionalsModal

### Exemplo de Uso

```tsx
import { ProfessionalsModal } from "./components/modals";
import { STATIC_PROFESSIONALS } from "./constants";
import type { Professional } from "./types";

export function ProfessionalsView() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Professional | null>(null);

  return (
    <ProfessionalsModal
      isOpen={isOpen}
      professionals={STATIC_PROFESSIONALS}
      selectedService={selectedService}
      selectedProfessional={selected}
      onProfessionalSelect={(professional) => {
        setSelected(professional);
        console.log("Profissional selecionado:", professional.name);
      }}
      onClose={() => setIsOpen(false)}
      onBack={() => setIsOpen(false)}
    />
  );
}
```

---

## 🎨 Componente: CheckoutModal

### Exemplo de Uso

```tsx
import { CheckoutModal } from "./components/modals";
import type { CheckoutForm } from "./types";

export function CheckoutView() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"register" | "login">("register");
  const [form, setForm] = useState<CheckoutForm>({
    firstName: "",
    lastName: "",
    phone: "",
    birthday: "",
    notes: "",
    email: "",
    password: "",
  });

  return (
    <CheckoutModal
      isOpen={isOpen}
      checkoutTab={tab}
      checkoutForm={form}
      selectedService={selectedService}
      selectedProfessional={selectedProfessional}
      appointment={appointment}
      onTabChange={setTab}
      onFormChange={(updates) => {
        setForm((prev) => ({ ...prev, ...updates }));
      }}
      onClose={() => setIsOpen(false)}
      onBack={() => setIsOpen(false)}
      onConfirm={() => {
        console.log("Confirmado:", form);
        setIsOpen(false);
      }}
    />
  );
}
```

---

## 🎨 Componente: SuccessModal

### Exemplo de Uso

```tsx
import { SuccessModal } from "./components/modals";
import type { AppointmentData } from "./types";

export function SuccessView() {
  const [isOpen, setIsOpen] = useState(true);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const appointmentData: AppointmentData = {
    id: "12345",
    date: "25 de Janeiro de 2024",
    time: "14:00",
    clientName: "João Silva",
    phone: "(11) 98233-5184",
    professional: "Vitor",
    service: "Corte de Cabelo",
    email: "joao@email.com",
  };

  return (
    <SuccessModal
      isOpen={isOpen}
      showSideModal={true}
      appointmentData={appointmentData}
      successMessage="Agendamento realizado com sucesso!"
      passwordSaved={passwordSaved}
      showPasswordForm={passwordForm}
      showPassword={showPassword}
      passwordInput={passwordInput}
      onClose={() => setIsOpen(false)}
      onPasswordInputChange={setPasswordInput}
      onPasswordToggle={() => setShowPassword(!showPassword)}
      onPasswordSave={() => {
        console.log("Senha salva:", passwordInput);
        setPasswordSaved(true);
        setPasswordForm(false);
      }}
      onDefinePassword={() => setPasswordForm(true)}
    />
  );
}
```

---

## 🎨 Componente: ViewServicesModal

### Exemplo de Uso

```tsx
import { ViewServicesModal } from "./components/modals";
import { STATIC_SERVICES } from "./constants";
import { useAppointment } from "./hooks";

export function ViewServicesView() {
  const [isOpen, setIsOpen] = useState(false);
  const { groupServicesByCategory } = useAppointment();

  return (
    <ViewServicesModal
      isOpen={isOpen}
      services={STATIC_SERVICES}
      onClose={() => setIsOpen(false)}
      groupServicesByCategory={groupServicesByCategory}
    />
  );
}
```

---

## 🎨 Componente: ViewProfessionalsModal

### Exemplo de Uso

```tsx
import { ViewProfessionalsModal } from "./components/modals";
import { STATIC_PROFESSIONALS } from "./constants";

export function ViewProfessionalsView() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ViewProfessionalsModal
      isOpen={isOpen}
      professionals={STATIC_PROFESSIONALS}
      onClose={() => setIsOpen(false)}
    />
  );
}
```

---

## 🔗 Integração Completa no page.tsx

### Exemplo Mínimo

```tsx
"use client";

import { useState } from "react";
import { useChat, useAppointment } from "./hooks";
import {
  MenuModal,
  CategoriesModal,
  ServicesModal,
  DateModal,
  ProfessionalsModal,
  CheckoutModal,
  SuccessModal,
  ViewServicesModal,
  ViewProfessionalsModal,
} from "./components/modals";
import { STATIC_SERVICES, STATIC_PROFESSIONALS } from "./constants";

export default function ChatPage() {
  const { messages, input, setInput, sendMessage } = useChat();
  const {
    appointment,
    selectedService,
    selectedProfessional,
    selectedCategory,
    getCalendarDays,
    getAvailableTimes,
    groupServicesByCategory,
  } = useAppointment();

  // Estado dos modals
  const [modals, setModals] = useState({
    menu: true,
    categories: false,
    services: false,
    date: false,
    professionals: false,
    checkout: false,
    success: false,
    viewServices: false,
    viewProfessionals: false,
  });

  // Handlers
  const openModal = (modal: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modal]: true }));
  };

  const closeModal = (modal: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modal]: false }));
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id}>{msg.text}</div>
        ))}
      </div>

      {/* Modals */}
      <MenuModal
        isOpen={modals.menu}
        onMenuOption={() => openModal("categories")}
        onPush={() => {}}
      />

      <CategoriesModal
        isOpen={modals.categories}
        services={STATIC_SERVICES}
        selectedCategory={selectedCategory}
        onCategorySelect={() => openModal("services")}
        onClose={() => closeModal("categories")}
        onBack={() => closeModal("categories")}
      />

      {/* ... outros modals ... */}

      {/* Input */}
      <input value={input} onChange={(e) => setInput(e.target.value)} />
    </div>
  );
}
```

---

**Nota**: Todos os exemplos acima são pseudo-código para mostrar o padrão de uso.
Consulte os arquivos específicos para a implementação completa.
