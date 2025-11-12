"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">Adicionar item</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogTitle>Adicionar item à mala</DialogTitle>

          <div className="pt-2">
            <Select onValueChange={(val) => setSelectedItem(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={loading}>{loading ? 'Adicionando...' : 'Adicionar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
