'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { Card } from '@/components/ui/card'

export default function DialogInsideCard() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card className="p-4 bg-[#A67C52] text-white rounded-md">
        <div className="flex justify-between items-center">
          <span>Mala 1</span>
          <button
            onClick={() => setOpen(true)}
            className="bg-white text-[#A67C52] px-3 py-1 rounded text-sm"
          >
            Adicionar item
          </button>
        </div>
      </Card>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg w-[300px]">
            <Dialog.Title className="text-lg font-bold mb-4">Adicionar item à mala</Dialog.Title>
            <p>Conteúdo do modal aqui</p>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 bg-gray-300 px-3 py-1 rounded"
            >
              Fechar
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
