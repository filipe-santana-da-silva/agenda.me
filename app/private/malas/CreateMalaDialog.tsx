'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PlusIcon } from '@radix-ui/react-icons'

interface Props {
  onCreated?: () => void
}

export function CreateMalaDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('Bag')
      .insert({ name })

    if (!error) {
      setOpen(false)
      setName('')
      onCreated?.()
    }

    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition flex items-center gap-2"
      >
        <PlusIcon />
        Nova Mala
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-[320px]">
            <Dialog.Title className="text-xl font-bold mb-4">Criar nova mala</Dialog.Title>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da mala"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleCreate}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full transition"
            >
              {loading ? 'Criando...' : 'Criar'}
            </button>

            <button
              onClick={() => setOpen(false)}
              className="mt-4 text-sm text-gray-500 underline hover:text-gray-700"
            >
              Cancelar
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
