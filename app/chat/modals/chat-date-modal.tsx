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
      <div className="bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row w-full max-w-4xl max-h-[95vh] lg:max-h-[90vh] animate-in zoom-in-95">
        {/* Datas à esquerda/topo */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
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
