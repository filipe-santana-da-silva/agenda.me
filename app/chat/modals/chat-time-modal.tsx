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
      <div className="bg-white rounded-3xl shadow-xl flex flex-col lg:flex-row w-full max-w-4xl max-h-[95vh] lg:max-h-[90vh] animate-in zoom-in-95">
        {/* Horários à esquerda/topo */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
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
