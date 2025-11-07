'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Props {
  bagId: string
  onAdded?: () => void
}

export function AddItemToBagDialog({ bagId, onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<{ id: string; name: string }[]>([])
  const [selectedItem, setSelectedItem] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) fetchStockItems()
  }, [open])

  async function fetchStockItems() {
    const supabase = createClient()
    const { data, error } = await supabase.from('StockItem').select('id, name')
    if (data && !error) setItems(data)
  }

  async function handleAdd() {
    if (!selectedItem) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('_BagItems')
      .insert({ bagId, stockItemId: selectedItem })

    if (!error) {
      setOpen(false)
      setSelectedItem('')
      onAdded?.()
    }

    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
      >
        Adicionar item
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg w-[300px]"
          >
            <Dialog.Title className="text-lg font-bold mb-4">Adicionar item à mala</Dialog.Title>

            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            >
              <option value="">Selecione um item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleAdd}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </button>

            <button
              onClick={() => setOpen(false)}
              className="mt-4 text-sm text-gray-500 underline"
            >
              Cancelar
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
