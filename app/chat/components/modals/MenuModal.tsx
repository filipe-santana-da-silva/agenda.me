import { Button } from "@/components/ui/button";

interface MenuModalProps {
  isOpen: boolean;
  onMenuOption: (optionId: string) => void;
  onPush: (path: string) => void;
}

export const MenuModal = ({ isOpen, onMenuOption, onPush }: MenuModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Opções</h2>
        <div className="space-y-3">
          <button
            onClick={() => onMenuOption("agendar")}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
          >
            📅 Agendar
          </button>
          <button
            onClick={() => onMenuOption("servicos")}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
          >
            ✂️ Serviços
          </button>
          <button
            onClick={() => onMenuOption("profissionais")}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
          >
            Profissionais
          </button>
          <button
            onClick={() => onPush("/booking")}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-900"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
};
