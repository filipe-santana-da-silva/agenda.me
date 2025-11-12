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
        <div>
          <strong>Habilidades:</strong>
          <div className="mt-1 space-y-1">
            {(() => {
              const skills = recreador.skills ?? { recreacao: 0, pintura: 0, balonismo: 0, oficina: 0 }
              return Object.entries(skills).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="capitalize w-28">{k}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map((i) => (
                      <span key={i} className={`text-xl ${v >= i ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>
        <p><strong>RG:</strong> {recreador.rg}</p>
        <p><strong>CPF:</strong> {recreador.cpf}</p>
  <p><strong>Telefone:</strong> {recreador.phone}</p>
  <p><strong>Endereço:</strong> {recreador.address}</p>
  <p><strong>PIX:</strong> {recreador.pixKey || '—'}</p>
  <p><strong>Tamanho do uniforme:</strong> {recreador.uniformSize || '—'}</p>
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
