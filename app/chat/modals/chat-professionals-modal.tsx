'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Professional {
  id: string;
  name: string;
  position?: string;
  department?: string;
  imageUrl?: string;
}

interface ChatProfessionalsModalProps {
  professionals: Professional[];
  selectedProfessional: Professional | null;
  onProfessionalSelect: (professional: Professional) => void;
  onOpenChange: (open: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ChatProfessionalsModal({
  professionals,
  selectedProfessional,
  onProfessionalSelect,
  onOpenChange,
  onNext,
  onBack,
}: ChatProfessionalsModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl max-h-[95vh] animate-in zoom-in-95 overflow-hidden grid grid-cols-[5rem_1fr_20rem]">
        {/* Barra de Progresso - Esquerda */}
        <div className="w-20 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 border-r border-gray-200 shrink-0">
          <div className="flex flex-col items-center gap-3 h-full justify-center">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === 3
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {index < 4 && <div className="w-0.5 h-6 bg-gray-300 my-1"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Profissionais à esquerda/topo */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Selecione um profissional</h2>
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
            {professionals.map((professional) => (
              <button
                key={professional.id}
                onClick={() => onProfessionalSelect(professional)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 group ${
                  selectedProfessional?.id === professional.id
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full shrink-0 bg-gray-100 overflow-hidden border-2 border-gray-300 box-border">
                  {professional.imageUrl ? (
                    <Image
                      src={professional.imageUrl}
                      alt={professional.name}
                      width={80}
                      height={80}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-lg lg:text-2xl">
                      {professional.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-gray-900 text-base lg:text-lg truncate">{professional.name}</div>
                  {professional.position && <div className="text-sm text-gray-600 mt-1">{professional.position}</div>}
                  {professional.department && <div className="text-xs text-gray-500 mt-1">{professional.department}</div>}
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
              {selectedProfessional && (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Profissional</div>
                  <div className="font-semibold text-gray-900 text-lg">{selectedProfessional.name}</div>
                  {selectedProfessional.position && <div className="text-sm text-gray-500 mt-1">{selectedProfessional.position}</div>}
                </div>
              )}
              {!selectedProfessional && (
                <div className="text-center text-gray-500 py-8">
                  Selecione um profissional
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
              disabled={!selectedProfessional}
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
