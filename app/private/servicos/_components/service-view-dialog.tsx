'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, DollarSign, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

type Service = {
  id: string;
  name: string;
  description?: string;
  duration: string;
  price: number | null;
  image_url?: string | null;
  commission_rate?: number;
};

interface ServiceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
}

export function ServiceViewDialog({ open, onOpenChange, service }: ServiceViewDialogProps) {
  if (!service) return null;

  const formatDuration = (duration: string) => {
    try {
      // Se for em formato interval do PostgreSQL (ex: "01:00:00")
      if (typeof duration === 'string' && duration.includes(':')) {
        const parts = duration.split(':');
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        
        if (hours > 0 && minutes > 0) {
          return `${hours}h ${minutes}min`;
        } else if (hours > 0) {
          return `${hours}h`;
        } else if (minutes > 0) {
          return `${minutes}min`;
        }
      }
      return duration;
    } catch {
      return duration;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Detalhes do Serviço
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </div>
                {service.image_url && (
                  <div className="shrink-0">
                    <Image
                      src={service.image_url}
                      alt={service.name}
                      width={100}
                      height={100}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {service.description && (
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-700">{service.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-600">Duração</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDuration(service.duration)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-600">Preço</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {service.price !== null ? formatPrice(service.price) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {service.commission_rate && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-xs font-medium text-gray-600">Taxa de Comissão</p>
                  <p className="text-sm font-semibold text-gray-900">{service.commission_rate}%</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
