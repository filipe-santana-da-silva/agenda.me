"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { AppointmentData } from "../../types";

interface SuccessModalProps {
  isOpen: boolean;
  showSideModal: boolean;
  appointmentData: AppointmentData | null;
  successMessage: string;
  passwordSaved: boolean;
  showPasswordForm: boolean;
  showPassword: boolean;
  passwordInput: string;
  onClose: () => void;
  onPasswordInputChange: (value: string) => void;
  onPasswordToggle: () => void;
  onPasswordSave: () => void;
  onDefinePassword: () => void;
}

export const SuccessModal = ({
  isOpen,
  showSideModal,
  appointmentData,
  successMessage,
  passwordSaved,
  showPasswordForm,
  showPassword,
  passwordInput,
  onClose,
  onPasswordInputChange,
  onPasswordToggle,
  onPasswordSave,
  onDefinePassword,
}: SuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="flex max-h-[90vh] shadow-xl rounded-3xl overflow-hidden">
        {/* Side Modal */}
        {showSideModal && (
          <div className="w-80 bg-gray-100 flex flex-col overflow-y-auto">
            {/* Progress Bar com Bolinhas */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step}>
                    <div
                      className={`w-3 h-3 rounded-full transition-all ${
                        step <= 5 ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              {/* Checkmark com círculos cinzas */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gray-300 rounded-full">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-400 rounded-full">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Message */}
              <p className="text-center text-gray-600 text-sm leading-relaxed">
                Seu compromisso foi agendado com sucesso. Guarde esta
                confirmação para seu controle.
              </p>
            </div>
          </div>
        )}

        {/* Main Modal */}
        <div className="bg-white max-w-2xl w-full overflow-y-auto max-h-[90vh] relative">
          {successMessage.includes("sucesso") && appointmentData ? (
            // Success Details
            <div className="p-8 bg-white">
              <button
                onClick={onClose}
                className="absolute top-8 right-20 text-gray-600 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>

              <div className="text-center mb-8">
                {/* Checkmark em círculo verde */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-green-100 rounded-full">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full shadow-lg">
                      <svg
                        className="w-10 h-10 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Title and ID */}
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Agendamento confirmado
                </h2>
                <p className="text-gray-500 text-lg font-semibold mb-6">
                  #{appointmentData.id}
                </p>

                {/* Add to Calendar Button */}
                <button className="text-blue-600 hover:text-blue-700 text-base font-semibold flex items-center justify-center gap-2 mx-auto mb-12">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                  </svg>
                  Adicionar à agenda
                </button>
              </div>

              {/* Appointment Details */}
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-6 pb-4 border-b border-gray-100">
                  <div className="text-left">
                    <div className="text-xs text-gray-500 font-semibold mb-2">
                      Data:
                    </div>
                    <div className="text-gray-900 font-semibold text-sm">
                      {appointmentData.date}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-500 font-semibold mb-2">
                      Nome:
                    </div>
                    <div className="text-gray-900 font-semibold text-sm">
                      {appointmentData.clientName}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 pb-4 border-b border-gray-100">
                  <div className="text-left">
                    <div className="text-xs text-gray-500 font-semibold mb-2">
                      Hora:
                    </div>
                    <div className="text-gray-900 font-semibold text-sm">
                      {appointmentData.time}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-500 font-semibold mb-2">
                      Telefone:
                    </div>
                    <div className="text-gray-900 font-semibold text-sm">
                      {appointmentData.phone}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 pb-4 border-b border-gray-100">
                  <div className="text-left">
                    <div className="text-xs text-gray-500 font-semibold mb-2">
                      Profissional:
                    </div>
                    <div className="text-gray-900 font-semibold text-sm">
                      {appointmentData.professional}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-500 font-semibold mb-2">
                      Email:
                    </div>
                    <div className="text-gray-900 font-semibold text-sm">
                      {appointmentData.email || "Seu email"}
                    </div>
                  </div>
                </div>
                <div className="text-left pt-4">
                  <div className="text-xs text-gray-500 font-semibold mb-2">
                    Serviço:
                  </div>
                  <div className="text-gray-900 font-semibold text-sm">
                    {appointmentData.service}
                  </div>
                </div>
              </div>

              {/* Info Message Before Saving */}
              {!passwordSaved && (
                <div className="bg-blue-50 rounded-2xl p-4 mb-8">
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Seu agendamento está confirmado, esta etapa não é
                    obrigatória. Definindo uma senha agora você poderá agendar
                    na próxima vez sem preencher os dados ou ainda pode
                    cancelar o agendamento pela área do cliente.
                  </p>
                </div>
              )}

              {/* Password Form or Button */}
              {!passwordSaved && (
                <>
                  {showPasswordForm ? (
                    <div className="flex gap-3 mb-8">
                      <div className="flex-1 relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Defina sua senha"
                          value={passwordInput}
                          onChange={(e) =>
                            onPasswordInputChange(e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={onPasswordToggle}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3C5.58 3 2.238 5.957.333 10a13.364 13.364 0 001.858 3.573l1.534-1.534A9.964 9.964 0 015.07 9.66l1.428-1.428a4 4 0 015.664 5.664l1.429-1.429a9.964 9.964 0 00-1.428-2.536l1.534-1.534C17.762 14.043 20.957 10 10 3zm4.293 4.293a1 1 0 10-1.414 1.414A3 3 0 113 10a1 1 0 00-2 0 5 5 0 009.293-2.707z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      <button
                        onClick={onPasswordSave}
                        className="bg-gray-900 text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-all whitespace-nowrap"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={onDefinePassword}
                      className="w-full bg-gray-900 text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-all mb-8"
                    >
                      Definir uma senha
                    </button>
                  )}
                </>
              )}

              {/* Message After Saving Password */}
              {passwordSaved && (
                <div className="bg-gray-100 rounded-2xl p-4 mb-8">
                  <p className="text-center text-gray-900 font-semibold text-sm leading-relaxed">
                    Ótimo, agora você pode gerenciar seus agendamentos na Área
                    do Cliente
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Error Details
            <div className="p-8 text-center bg-white">
              <h2 className="text-4xl mb-4">⚠️</h2>
              <p className="text-gray-900 mb-6 text-base leading-relaxed">
                {successMessage}
              </p>
              <button
                onClick={onClose}
                className="w-full bg-gray-900 text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-all"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
