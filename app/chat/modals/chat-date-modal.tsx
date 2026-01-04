'use client';

import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';

interface ChatDateModalProps {
  onOpenChange: (open: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  appointment: Record<string, unknown>;
}

export default function ChatDateModal({
  onOpenChange,
  onNext,
  onBack,
}: ChatDateModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Gerar próximas 30 dias disponíveis (excluindo domingos)
  const availableDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      if (date.getDay() !== 0) { // Excluir domingos
        dates.push(date.toISOString().split('T')[0]);
      }
    }

    return dates;
  }, []);

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
                    step === 4
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

        {/* Datas à esquerda/topo */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">📅 Escolha a data</h2>
            <Button
              onClick={() => {
                onOpenChange(false);
                onBack();
              }}
              variant="ghost"
              size="sm"
              className="p-0 h-auto text-gray-600 hover:bg-gray-100 text-xl"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-2">
            {availableDates.map((date) => {
              const dateObj = new Date(date);
              const formatted = dateObj.toLocaleDateString('pt-BR', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left font-medium ${
                    selectedDate === date
                      ? 'border-blue-400 bg-blue-50 text-gray-900'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  {formatted}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resumo à direita/bottom */}
        <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 lg:p-8 flex flex-col justify-between rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
          <div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Resumo</h3>
            {selectedDate && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Data selecionada</div>
                <div className="font-semibold text-gray-900 text-lg">
                  {new Date(selectedDate).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            )}
            {!selectedDate && (
              <div className="text-center text-gray-500 py-8">
                Selecione uma data
              </div>
            )}
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
              disabled={!selectedDate}
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
