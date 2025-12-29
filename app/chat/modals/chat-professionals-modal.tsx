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
      <div className="bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row w-full max-w-4xl max-h-[95vh] lg:max-h-[90vh] animate-in zoom-in-95">
        {/* Profissionais à esquerda/topo */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Escolha um profissional</h2>
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
