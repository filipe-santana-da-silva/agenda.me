"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Service, Professional, AppointmentData, CheckoutForm } from "../../types";

interface CheckoutModalProps {
  isOpen: boolean;
  checkoutTab: "register" | "login";
  checkoutForm: CheckoutForm;
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  appointment: AppointmentData;
  onTabChange: (tab: "register" | "login") => void;
  onFormChange: (form: Partial<CheckoutForm>) => void;
  onClose: () => void;
  onBack: () => void;
  onConfirm: () => void;
}

export const CheckoutModal = ({
  isOpen,
  checkoutTab,
  checkoutForm,
  selectedService,
  selectedProfessional,
  appointment,
  onTabChange,
  onFormChange,
  onClose,
  onBack,
  onConfirm,
}: CheckoutModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl flex flex-col w-full max-w-5xl max-h-[95vh]">
        {/* Progress Bar */}
        <div className="hidden lg:flex items-center justify-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    step === 4 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {index < 4 && (
                  <div
                    className={`w-8 h-0.5 ${step === 4 ? "bg-blue-500" : "bg-gray-300"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Form Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {checkoutTab === "register" ? "Registre-se" : "Faça seu login"}
                </h2>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-gray-600 hover:bg-gray-100 text-xl shrink-0"
                >
                  ✕
                </Button>
              </div>

              {/* Tab Buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => onTabChange("register")}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    checkoutTab === "register"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  Registre-se
                </button>
                <button
                  onClick={() => onTabChange("login")}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    checkoutTab === "login"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  Faça seu login
                </button>
              </div>

              {/* Form Inputs */}
              <div className="space-y-6">
              {checkoutTab === "register" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={checkoutForm.firstName}
                      onChange={(e) =>
                        onFormChange({ firstName: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Seu sobrenome"
                      value={checkoutForm.lastName}
                      onChange={(e) =>
                        onFormChange({ lastName: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="(XX) 98233-5184"
                    value={checkoutForm.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      let formatted = value;
                      if (value.length > 0) {
                        if (value.length <= 2) {
                          formatted = `(${value}`;
                        } else if (value.length <= 7) {
                          formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                        } else {
                          formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                        }
                      }
                      onFormChange({ phone: formatted });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    placeholder="Seu aniversário"
                    value={checkoutForm.birthday}
                    onChange={(e) =>
                      onFormChange({ birthday: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Observações"
                    value={checkoutForm.notes}
                    onChange={(e) => onFormChange({ notes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                  />
                </>
              ) : (
                <>
                  <input
                    type="tel"
                    placeholder="(XX) 98233-5184"
                    value={checkoutForm.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      let formatted = value;
                      if (value.length > 0) {
                        if (value.length <= 2) {
                          formatted = `(${value}`;
                        } else if (value.length <= 7) {
                          formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                        } else {
                          formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                        }
                      }
                      onFormChange({ phone: formatted });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Sua senha"
                    value={checkoutForm.password}
                    onChange={(e) =>
                      onFormChange({ password: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-center">
                    <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                      Esqueceu a senha?
                    </button>
                  </div>
                </>
              )}
              </div>
            </div>

            {/* Action Buttons - Fixed Bottom on Mobile */}
            <div className="shrink-0 border-t border-gray-200 bg-white p-6 lg:p-8 flex gap-3 lg:hidden">
              <button
                onClick={onBack}
                className="flex-1 py-2 px-8 rounded-full border-2 border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 transition-all text-sm"
              >
                ← Voltar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2 px-8 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all text-sm"
              >
                Confirmar →
              </button>
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden lg:flex border-t border-gray-200 p-4 gap-3 justify-center mt-6">
              <button
                onClick={onBack}
                className="py-2 px-8 rounded-full border-2 border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 transition-all text-sm"
              >
                ← Voltar
              </button>
              <button
                onClick={onConfirm}
                className="py-2 px-8 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all text-sm"
              >
                Confirmar →
              </button>
            </div>
          </div>

          {/* Summary - Hidden on Mobile */}
          <div className="hidden lg:flex bg-gray-50 p-6 lg:p-12 overflow-y-auto flex-col border-l border-gray-200 w-80">
            <h3 className="text-xl font-bold text-gray-900 mb-8">Resumo</h3>
            <div className="space-y-4">
              {selectedService && (
                <div className="flex justify-between items-center gap-4 pb-4 border-b border-gray-200">
                  <div className="text-sm text-gray-500">Serviço</div>
                  <div className="flex items-center gap-2">
                    {selectedService.imageUrl ? (
                      <Image
                        src={selectedService.imageUrl}
                        alt={selectedService.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                        {selectedService.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="text-right font-semibold text-gray-900 text-sm">
                      {selectedService.name}
                    </div>
                  </div>
                </div>
              )}
              {selectedProfessional && (
                <div className="flex justify-between items-center gap-4 py-4 border-b border-gray-200">
                  <div className="text-sm text-gray-500">Profissional</div>
                  <div className="text-right font-semibold text-gray-900 text-sm">
                    {selectedProfessional.name}
                  </div>
                </div>
              )}
              {appointment.date && (
                <div className="flex justify-between items-start gap-4 py-4 border-b border-gray-200">
                  <div className="text-sm text-gray-500">Data</div>
                  <div className="text-right font-semibold text-gray-900 text-sm">
                    {new Date(
                      appointment.date + "T00:00:00"
                    ).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              )}
              {appointment.time && (
                <div className="flex justify-between items-start gap-4 py-4 border-b border-gray-200">
                  <div className="text-sm text-gray-500">Hora</div>
                  <div className="text-right font-semibold text-gray-900 text-sm">
                    {appointment.time}
                  </div>
                </div>
              )}
              {(checkoutTab === "register" && checkoutForm.firstName) ||
              (checkoutTab === "login" && checkoutForm.firstName) ? (
                <div className="flex justify-between items-start gap-4 pt-4">
                  <div className="text-sm text-gray-500">Dados cliente</div>
                  <div className="text-right font-semibold text-gray-900 text-sm">
                    {checkoutTab === "register"
                      ? `${checkoutForm.firstName} ${checkoutForm.lastName}`.trim()
                      : `${checkoutForm.firstName} ${checkoutForm.lastName}`.trim()}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
