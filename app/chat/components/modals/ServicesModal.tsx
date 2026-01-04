"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Service } from "../../types";

interface ServicesModalProps {
  isOpen: boolean;
  services: Service[];
  selectedCategory: string | null;
  selectedService: Service | null;
  onServiceSelect: (service: Service) => void;
  onClose: () => void;
  onBack: () => void;
}

export const ServicesModal = ({
  isOpen,
  services,
  selectedCategory,
  selectedService,
  onServiceSelect,
  onClose,
  onBack,
}: ServicesModalProps) => {
  if (!isOpen) return null;

  const filteredServices =
    selectedCategory
      ? services.filter((s) => s.category === selectedCategory)
      : [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl flex w-full max-w-6xl h-[95vh] overflow-hidden">
        {/* Progress Bar - Left Sidebar */}
        <div className="w-20 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 border-r border-gray-200 shrink-0 h-full">
          <div className="flex flex-col items-center gap-3 h-full justify-center">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === 2 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {index < 4 && <div className="w-0.5 h-6 bg-gray-300 my-1"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden h-full">
          {/* Services */}
          <div className="flex-1 overflow-y-auto h-full">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Selecione um serviço
              </h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-gray-600 hover:bg-gray-100 text-xl shrink-0"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => onServiceSelect(service)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 group ${
                    selectedService?.id === service.id
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full shrink-0 bg-gray-100 overflow-hidden border-2 border-gray-300 box-border">
                    {service.imageUrl ? (
                      <Image
                        src={service.imageUrl}
                        alt={service.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg lg:text-2xl">
                        {service.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-gray-900 text-base lg:text-lg">
                      {service.name}
                    </div>
                    {service.description && (
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {service.description}
                      </div>
                    )}
                    {service.duration && (
                      <div className="text-xs text-gray-600 mt-2">
                        {service.duration}
                      </div>
                    )}
                    {service.price && (
                      <div className="text-base font-bold text-blue-600 mt-2">
                        R$ {service.price}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-200 mt-6">
              <Button onClick={onBack} variant="outline" className="w-full">
                ← Voltar
              </Button>
            </div>
            </div>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 hidden lg:flex flex-col justify-between shrink-0 h-full">
            <div className="p-6 lg:p-8 overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Resumo
              </h3>
              <div className="space-y-4">
                {selectedService && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Serviço</div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {selectedService.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {selectedService.duration}
                    </div>
                    <div className="text-lg font-bold text-blue-600 mt-2">
                      R$ {selectedService.price}
                    </div>
                  </div>
                )}
                {!selectedService && (
                  <div className="text-center text-gray-500 py-8">
                    Selecione um serviço
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-200 mt-6 p-6 lg:p-8">
              <Button onClick={onBack} variant="outline" className="w-full">
                ← Voltar
              </Button>
              <Button
                onClick={onClose}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                Próximo passo →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
