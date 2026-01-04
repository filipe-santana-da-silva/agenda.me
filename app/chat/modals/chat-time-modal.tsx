'use client';

import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';

interface ChatTimeModalProps {
  onOpenChange: (open: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  appointment: Record<string, unknown>;
}

export default function ChatTimeModal({
  onOpenChange,
  onNext,
  onBack,
}: ChatTimeModalProps) {
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Gerar horários disponíveis (09:00 às 18:00 em intervalos de 30 min)
  const availableTimes = useMemo(() => {
    const times: string[] = [];

    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break;
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        times.push(timeStr);
      }
    }

    return times;
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
                    step === 5
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

        {/* Horários à esquerda/topo */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">⏰ Escolha a hora</h2>
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

          <div className="grid grid-cols-3 gap-3">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 font-medium text-sm ${
                  selectedTime === time
                    ? 'border-blue-400 bg-blue-50 text-gray-900'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-900'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Resumo à direita/bottom */}
        <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 lg:p-8 flex flex-col justify-between rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
          <div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Resumo</h3>
            {selectedTime && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Horário selecionado</div>
                <div className="font-semibold text-gray-900 text-lg">{selectedTime}</div>
              </div>
            )}
            {!selectedTime && (
              <div className="text-center text-gray-500 py-8">
                Selecione um horário
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
              disabled={!selectedTime}
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
