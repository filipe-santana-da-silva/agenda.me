'use client';

import { useRouter } from 'next/navigation';

interface ChatMenuModalProps {
  onMenuOption: (option: string) => void;
  onOpenChange: (open: boolean) => void;
}

export default function ChatMenuModal({
  onMenuOption,
  onOpenChange,
}: ChatMenuModalProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[95vh] animate-in fade-in zoom-in-95 overflow-hidden grid grid-cols-[5rem_1fr]">
        {/* Barra de Progresso - Esquerda */}
        <div className="w-20 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 border-r border-gray-200 shrink-0">
          <div className="flex flex-col items-center gap-3 h-full justify-center">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === 1
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

        {/* Conteúdo Central */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Opções</h2>
        <div className="space-y-3">
          <button
            onClick={() => onMenuOption('agendar')}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
          >
            📅 Agendar
          </button>
          <button
            onClick={() => onMenuOption('servicos')}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
          >
            ✂️ Serviços
          </button>
          <button
            onClick={() => onMenuOption('profissionais')}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
          >
            Profissionais
          </button>
          <button
            onClick={() => router.push('/booking')}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
          >
            ← Voltar
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
