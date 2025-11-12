"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/card'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  bagId: string
  number: number
  onAdded?: () => void
}

export function MalaCard({ bagId, number, onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<{ name: string; quantity: number }[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState('')
  const [stockItems, setStockItems] = useState<{ id: string; name: string }[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    if (dialogOpen) fetchStockItems()
  }, [dialogOpen])

  async function fetchItems() {
    const { data, error } = await supabase
      .from('_BagItems')
      .select('stockItem:stockItemId (name, quantity)')
      .eq('bagId', bagId)

    if (error) {
      console.error('Erro ao buscar itens da mala:', error.message)
      return
    }

    if (data) {
      const formatted = data.map((entry: any) => ({
        name: entry.stockItem?.name,
        quantity: entry.stockItem?.quantity ?? 1,
      }))
      setItems(formatted)
    }
  }

  async function fetchStockItems() {
    const { data, error } = await supabase.from('StockItem').select('id, name')
    if (error) {
      console.error('Erro ao buscar StockItems:', error.message)
      return
    }
    if (data) setStockItems(data)
  }

  async function handleAddItem() {
    if (!selectedItem) return

    const { error } = await supabase
      .from('_BagItems')
      .insert({ bagId, stockItemId: selectedItem })

    if (error) {
      console.error('Erro ao adicionar item à mala:', error.message)
      return
    }

    setSelectedItem('')
    setDialogOpen(false)
    fetchItems()
    onAdded?.()
  }

  return (
    <>
      <Card className="bg-[#A67C52] text-white rounded-md p-4 shadow-md hover:shadow-lg transition">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-lg flex items-center gap-2">Mala {number}</span>
          <button onClick={() => setOpen(!open)} className="text-white text-sm underline hover:text-gray-200">{open ? 'Fechar' : 'Abrir'}</button>
        </div>

        {open && (
          <div className="mt-2">
            <ul className="text-sm space-y-1 mb-3">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <li key={index} className="border-b border-white/30 pb-1">{item.name} <span className="text-white/70">x{item.quantity}</span></li>
                ))
              ) : (
                <li className="italic text-white/80">Nenhum item</li>
              )}
            </ul>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white text-[#A67C52] px-3 py-1 rounded text-sm">+ Adicionar item</Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
      </Card>

      {/* keep legacy modal for adding item (CreateMalaDialog/AddItemToBagDialog handle this) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogTitle>Adicionar item à mala</DialogTitle>
          <div className="pt-2">
            <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} className="w-full border rounded px-3 py-2 mb-4">
              <option value="">Selecione um item</option>
              {stockItems.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="mt-3">
            <Button onClick={handleAddItem} className="w-full">Adicionar</Button>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="mt-2">Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
