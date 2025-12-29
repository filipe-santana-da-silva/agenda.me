'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Service {
  id: string;
  name: string;
  duration: string | number;
  price: number;
  imageUrl?: string;
}

interface ChatServicesModalProps {
  services: Service[];
  selectedService: Service | null;
  onServiceSelect: (service: Service) => void;
  onOpenChange: (open: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ChatServicesModal({
  services,
  selectedService,
  onServiceSelect,
  onOpenChange,
  onNext,
  onBack,
}: ChatServicesModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row w-full max-w-4xl max-h-[95vh] lg:max-h-[90vh] animate-in zoom-in-95">
        {/* Serviços à esquerda/topo */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Se desejam, adicionem mais serviços</h2>
            <Button
              onClick={() => {
                onOpenChange(false);
                onBack();
              }}
              variant="ghost"
              size="sm"
              className="p-0 h-auto text-gray-600 hover:bg-gray-100 text-xl shrink-0"
            >
              ✕
            </Button>
          </div>
          <div className="space-y-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => onServiceSelect(service)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 group ${
                  selectedService?.id === service.id
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full shrink-0 bg-gray-100 overflow-hidden border-2 border-gray-300 box-border">
                  {service.imageUrl ? (
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      width={80}
                      height={80}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg lg:text-2xl">
                      {service.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-gray-900 text-base lg:text-lg truncate">{service.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{service.duration}</div>
                  {service.price && <div className="text-base font-bold text-blue-600 mt-2">R$ {service.price}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Resumo à direita/bottom */}
        <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 lg:p-8 flex flex-col justify-between rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
          <div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Resumo</h3>
            <div className="space-y-4">
              {selectedService && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Serviço</div>
                  <div className="font-semibold text-gray-900 text-lg">{selectedService.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{selectedService.duration}</div>
                  <div className="text-lg font-bold text-blue-600 mt-2">R$ {selectedService.price}</div>
                </div>
              )}
              {!selectedService && (
                <div className="text-center text-gray-500 py-8">
                  Selecione um serviço
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full text-sm lg:text-base"
            >
              ← Voltar
            </Button>
            <Button
              onClick={onNext}
              disabled={!selectedService}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm lg:text-base"
            >
              Próximo passo →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
