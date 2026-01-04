"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Service } from "../../types";

interface ViewServicesModalProps {
  isOpen: boolean;
  services: Service[];
  onClose: () => void;
  groupServicesByCategory: (services: Service[]) => Record<string, Service[]>;
}

export const ViewServicesModal = ({
  isOpen,
  services,
  onClose,
  groupServicesByCategory,
}: ViewServicesModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              Serviços Disponíveis
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

          <div className="space-y-6">
            {services && services.length > 0 ? (
              Object.entries(groupServicesByCategory(services)).map(
                ([category, categoryServices]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                      {category}
                    </h3>
                    <div className="space-y-3">
                      {categoryServices.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
                        >
                          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full shrink-0 bg-gray-100 overflow-hidden border-2 border-gray-300 box-border">
                            {service.imageUrl ? (
                              <Image
                                src={service.imageUrl}
                                alt={service.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg lg:text-2xl">
                                {service.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-semibold text-gray-900 text-base lg:text-lg">
                              {service.name}
                            </div>
                            {service.description && (
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {service.description}
                              </div>
                            )}
                            {service.duration && (
                              <div className="text-xs text-gray-600 mt-2">
                                {service.duration}
                              </div>
                            )}
                            {service.price && (
                              <div className="text-base font-bold text-blue-600 mt-2">
                                R$ {service.price}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="text-center text-gray-500 py-8">
                Nenhum serviço encontrado
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
