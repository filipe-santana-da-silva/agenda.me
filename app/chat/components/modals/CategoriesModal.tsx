"use client";

import { Button } from "@/components/ui/button";
import type { Service } from "../../types";

interface CategoriesModalProps {
  isOpen: boolean;
  services: Service[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
  onClose: () => void;
  onBack: () => void;
}

export const CategoriesModal = ({
  isOpen,
  services,
  selectedCategory,
  onCategorySelect,
  onClose,
  onBack,
}: CategoriesModalProps) => {
  if (!isOpen) return null;

  const categories = Array.from(
    new Set(services.map((s) => s.category).filter(Boolean))
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl flex flex-col w-full max-w-2xl max-h-[95vh]">
        {/* Progress Bar */}
        <div className="hidden lg:flex items-center justify-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    step === 1 ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {index < 4 && (
                  <div
                    className={`w-8 h-0.5 ${step === 1 ? "bg-blue-500" : "bg-gray-300"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Categories */}
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Selecione uma categoria
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

            <div className="space-y-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategorySelect(category as string)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selectedCategory === category
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-semibold text-gray-900">{category}</div>
                  <div className="text-sm text-gray-500 mt-2">
                    {services.filter((s) => s.category === category).length}{" "}
                    serviço(s)
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-200 mt-6">
              <Button onClick={onBack} variant="outline" className="w-full">
                ← Voltar
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-80 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 lg:p-8 flex flex-col justify-between rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">
                Resumo
              </h3>
              <div className="space-y-4">
                {selectedCategory && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Categoria</div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {selectedCategory}
                    </div>
                  </div>
                )}
                {!selectedCategory && (
                  <div className="text-center text-gray-500 py-8">
                    Selecione uma categoria
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
