'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

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

interface ChatSuccessModalProps {
  message: string;
  onOpenChange: (open: boolean) => void;
  appointment: Record<string, unknown>;
  service: Service | null;
  professional: Professional | null;
}

export default function ChatSuccessModal({
  message,
  onOpenChange,
  appointment,
  service,
  professional,
}: ChatSuccessModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl max-h-[95vh] animate-in zoom-in-95 overflow-hidden grid grid-cols-[5rem_1fr]">
        {/* Barra de Progresso - Esquerda */}
        <div className="w-20 bg-linear-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 border-r border-gray-200 shrink-0">
          <div className="flex flex-col items-center gap-3 h-full justify-center">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step <= 5
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {index < 4 && <div className="w-0.5 h-6 bg-blue-500 my-1"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Conteúdo Central */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h2>
          <p className="text-gray-600 mb-6">{message}</p>

          {/* Detalhes do Agendamento */}
          <div className="space-y-4 mb-8 text-left bg-gray-50 rounded-xl p-4">
            {service && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">✂️</span>
                <div>
                  <div className="text-xs text-gray-600">Serviço</div>
                  <div className="font-semibold text-gray-900">{service.name}</div>
                </div>
              </div>
            )}

            {professional && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">👨‍💼</span>
                <div>
                  <div className="text-xs text-gray-600">Profissional</div>
                  <div className="font-semibold text-gray-900">{professional.name}</div>
                </div>
              </div>
            )}

            {appointment?.appointment_date && typeof appointment.appointment_date === 'string' ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="text-xs text-gray-600">Data</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ) : null}

            {appointment?.appointment_time && typeof appointment.appointment_time === 'string' ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <div className="text-xs text-gray-600">Horário</div>
                  <div className="font-semibold text-gray-900">{appointment.appointment_time as string}</div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/booking')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
            >
              Voltar ao Booking
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full"
            >
              Fechar
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
