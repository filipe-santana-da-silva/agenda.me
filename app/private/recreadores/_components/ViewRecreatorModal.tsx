'use client'

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Recreator } from './services-list'

interface ViewRecreatorModalProps {
  recreador: Recreator
  onClose: () => void
}

export function ViewRecreatorModal({ recreador }: ViewRecreatorModalProps) {
  const dias: string[] = Array.isArray(recreador.availabledays)
  ? recreador.availabledays
  : []

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Dados do Recreador</DialogTitle>
        <DialogDescription>Informações completas do recreador</DialogDescription>
      </DialogHeader>

      <div className="space-y-2 text-sm">
        <p><strong>Nome:</strong> {recreador.name}</p>
        <p><strong>Especialidade:</strong> {recreador.specialty}</p>
        <p className="flex items-center gap-1">
          <strong>Especialidade nível:</strong>
          {[...Array(recreador.specialtylevel)].map((_, i) => (
            <span key={i} className="text-yellow-400">★</span>
          ))}
        </p>
        <p><strong>RG:</strong> {recreador.rg}</p>
        <p><strong>CPF:</strong> {recreador.cpf}</p>
        <p><strong>Telefone:</strong> {recreador.phone}</p>
        <p><strong>Endereço:</strong> {recreador.address}</p>
        <p><strong>Observações:</strong> {recreador.notes || '—'}</p>
        <div>
          <strong>Disponibilidade de dias:</strong>
          <div className="flex gap-2 mt-1 flex-wrap">
            {dias.map((dia: string) => (
              <div
                key={dia}
                className="px-2 py-1 bg-gray-100 rounded text-xs border border-gray-300"
              >
                {dia}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
