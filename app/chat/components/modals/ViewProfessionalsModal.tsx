"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Professional } from "../../types";

interface ViewProfessionalsModalProps {
  isOpen: boolean;
  professionals: Professional[];
  onClose: () => void;
}

export const ViewProfessionalsModal = ({
  isOpen,
  professionals,
  onClose,
}: ViewProfessionalsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              Profissionais
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
            {professionals && professionals.length > 0 ? (
              professionals.map((professional) => (
                <div
                  key={professional.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full shrink-0 bg-gray-100 overflow-hidden border-2 border-gray-300 box-border">
                    {professional.imageUrl ? (
                      <Image
                        src={professional.imageUrl}
                        alt={professional.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg lg:text-2xl">
                        {professional.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-gray-900 text-base lg:text-lg truncate">
                      {professional.name}
                    </div>
                    {professional.position && (
                      <div className="text-sm text-gray-600 mt-1">
                        {professional.position}
                      </div>
                    )}
                    {professional.department && (
                      <div className="text-sm text-gray-600">
                        Departamento: {professional.department}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                Nenhum profissional encontrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
