"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Service, Professional } from "../../types";

interface ProfessionalsModalProps {
  isOpen: boolean;
  professionals: Professional[];
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  onProfessionalSelect: (professional: Professional) => void;
  onClose: () => void;
  onBack: () => void;
}

export const ProfessionalsModal = ({
  isOpen,
  professionals,
  selectedService,
  selectedProfessional,
  onProfessionalSelect,
  onClose,
  onBack,
}: ProfessionalsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl flex flex-col w-full max-w-4xl max-h-[95vh] lg:max-h-[90vh]">
        {/* Progress Bar */}
        <div className="hidden lg:flex items-center justify-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    step === 3 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {index < 4 && (
                  <div
                    className={`w-8 h-0.5 ${step === 3 ? "bg-blue-500" : "bg-gray-300"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Professionals */}
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Selecione um profissional
              </h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-gray-600 hover:bg-gray-100 text-xl"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3">
              {professionals && professionals.length > 0 ? (
                professionals.map((professional) => (
                  <button
                    key={professional.id}
                    onClick={() => onProfessionalSelect(professional)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 group ${
                      selectedProfessional?.id === professional.id
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <div className="shrink-0 w-20 h-20 rounded-full border-2 border-gray-300 overflow-hidden box-border">
                      {professional.imageUrl ? (
                        <Image
                          src={professional.imageUrl}
                          alt={professional.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                          {professional.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900 text-lg">
                        {professional.name}
                      </div>
                      {professional.position && (
                        <div className="text-sm text-gray-600 mt-1">
                          {professional.position}
                        </div>
                      )}
                      {professional.department && (
                        <div className="text-xs text-gray-500 mt-1">
                          {professional.department}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Nenhum profissional encontrado
                </div>
              )}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-200 mt-6">
              <Button onClick={onBack} variant="outline" className="w-full">
                ← Voltar
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 lg:p-8 flex flex-col justify-between rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo</h3>
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
                {selectedProfessional && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Profissional</div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {selectedProfessional.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {selectedProfessional.position}
                    </div>
                  </div>
                )}
                {!selectedService && !selectedProfessional && (
                  <div className="text-center text-gray-500 py-8">
                    Selecionando...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
