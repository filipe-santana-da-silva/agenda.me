'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Lazy load dos modais com skeletons de carregamento
const LoadingSkeleton = () => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
    <div className="bg-white rounded-3xl p-8 w-80">
      <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const ChatMenuModal = dynamic(() => import('./modals/chat-menu-modal'), {
  loading: LoadingSkeleton,
  ssr: false
});

const ChatServicesModal = dynamic(() => import('./modals/chat-services-modal'), {
  loading: LoadingSkeleton,
  ssr: false
});

const ChatProfessionalsModal = dynamic(() => import('./modals/chat-professionals-modal'), {
  loading: LoadingSkeleton,
  ssr: false
});

const ChatDateModal = dynamic(() => import('./modals/chat-date-modal'), {
  loading: LoadingSkeleton,
  ssr: false
});

const ChatSuccessModal = dynamic(() => import('./modals/chat-success-modal'), {
  loading: LoadingSkeleton,
  ssr: false
});

export interface ChatLayoutProps {
  messages: Array<{ id: string; content: string }>;
  isLoading: boolean;
  
  // Modal states
  showMenuModal: boolean;
  showServicesModal: boolean;
  showViewServicesModal: boolean;
  showProfessionalsModal: boolean;
  showViewProfessionalsModal: boolean;
  showDateModal: boolean;
  showSuccessModal: boolean;
  successMessage: string;
  
  // Modal handlers
  onMenuModalChange: (open: boolean) => void;
  onServicesModalChange: (open: boolean) => void;
  onViewServicesModalChange: (open: boolean) => void;
  onProfessionalsModalChange: (open: boolean) => void;
  onViewProfessionalsModalChange: (open: boolean) => void;
  onDateModalChange: (open: boolean) => void;
  onSuccessModalChange: (open: boolean) => void;
  
  // Menu handlers
  onMenuOption: (option: string) => void;
  onServiceSelect: (service: Service) => void;
  onProfessionalSelect: (professional: Professional) => void;
  
  // Data
  services: Service[];
  professionals: Professional[];
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  appointment: Record<string, unknown>;
}

interface Service {
  id: string;
  name: string;
  duration: string | number;
  price: number;
  imageUrl?: string;
}

interface Professional {
  id: string;
  name: string;
  position?: string;
  department?: string;
  imageUrl?: string;
}

export function ChatLayout({
  messages,
  isLoading,
  showMenuModal,
  showServicesModal,
  showProfessionalsModal,
  showDateModal,
  showSuccessModal,
  successMessage,
  onMenuModalChange,
  onServicesModalChange,
  onProfessionalsModalChange,
  onDateModalChange,
  onSuccessModalChange,
  onMenuOption,
  onServiceSelect,
  onProfessionalSelect,
  services,
  professionals,
  selectedService,
  selectedProfessional,
  appointment,
}: ChatLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6">
        <Link href="/booking">
          <Button variant="ghost" size="icon" className="size-6">
            <ChevronLeft className="size-6" />
          </Button>
        </Link>
        <h1 className="font-(family-name:--font-merriweather) text-xl tracking-tight italic">
          Agenda.ai
        </h1>
        <div className="size-6" />
      </header>

      {/* Status Message */}
      <div className="px-5 pt-6">
        <div className="rounded-xl border p-3">
          <p className="text-muted-foreground text-center text-sm">
            Seu assistente de agendamentos está online. Você pode agendar sem fazer login!
          </p>
        </div>
      </div>

      {/* Chat Container - com scroll otimizado */}
      <div className="flex-1 overflow-y-auto pb-32">
        {messages.map((message) => {
          return (
            <Suspense key={message.id} fallback={<div className="h-12" />}>
              {/* Renderização das mensagens */}
            </Suspense>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-2 px-3 pt-6 pr-14">
            <div className="bg-primary/12 flex size-8 shrink-0 items-center justify-center rounded-full border animate-pulse">
              <div className="text-primary size-3.5" />
            </div>
            <div className="text-muted-foreground text-sm">Digitando...</div>
          </div>
        )}
      </div>

      {/* Modais com Lazy Loading */}
      {showMenuModal && (
        <Suspense fallback={<div />}>
          <ChatMenuModal
            onMenuOption={onMenuOption}
            onOpenChange={onMenuModalChange}
          />
        </Suspense>
      )}

      {showServicesModal && (
        <Suspense fallback={<div />}>
          <ChatServicesModal
            services={services}
            selectedService={selectedService}
            onServiceSelect={onServiceSelect}
            onOpenChange={onServicesModalChange}
            onNext={() => {
              onServicesModalChange(false);
              onProfessionalsModalChange(true);
            }}
            onBack={() => {
              onServicesModalChange(false);
              onMenuModalChange(true);
            }}
          />
        </Suspense>
      )}

      {showProfessionalsModal && (
        <Suspense fallback={<div />}>
          <ChatProfessionalsModal
            professionals={professionals}
            selectedProfessional={selectedProfessional}
            onProfessionalSelect={onProfessionalSelect}
            onOpenChange={onProfessionalsModalChange}
            onNext={() => {
              onProfessionalsModalChange(false);
              onDateModalChange(true);
            }}
            onBack={() => {
              onProfessionalsModalChange(false);
              onServicesModalChange(true);
            }}
          />
        </Suspense>
      )}

      {showDateModal && (
        <Suspense fallback={<div />}>
          <ChatDateModal
            onOpenChange={onDateModalChange}
            onNext={() => {
              onDateModalChange(false);
              onSuccessModalChange(true);
            }}
            onBack={() => {
              onDateModalChange(false);
              onProfessionalsModalChange(true);
            }}
            appointment={appointment}
          />
        </Suspense>
      )}

      {showSuccessModal && (
        <Suspense fallback={<div />}>
          <ChatSuccessModal
            message={successMessage}
            onOpenChange={onSuccessModalChange}
            appointment={appointment}
            service={selectedService}
            professional={selectedProfessional}
          />
        </Suspense>
      )}
    </div>
  );
}
