"use client";

interface PasswordModalProps {
  isOpen: boolean;
  passwordInput: string;
  onPasswordChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const PasswordModal = ({
  isOpen,
  passwordInput,
  onPasswordChange,
  onCancel,
  onSave,
}: PasswordModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-60 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Defina sua senha
        </h3>

        <input
          type="password"
          placeholder="Defina sua senha"
          value={passwordInput}
          onChange={(e) => onPasswordChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-6 rounded-full border-2 border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="flex-1 bg-gray-900 text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-all"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
