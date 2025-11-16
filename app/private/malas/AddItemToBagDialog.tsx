"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  bagId: string
  onAdded?: () => void
}

interface StockItemDetail {
  id: string
  name: string
  quantity: number
}

export function AddItemToBagDialog({ bagId, onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<StockItemDetail[]>([])
  const [selectedItem, setSelectedItem] = useState<StockItemDetail | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) fetchStockItems()
  }, [open])

  async function fetchStockItems() {
    const supabase = createClient()
    const { data, error } = await supabase.from('StockItem').select('id, name, quantity')
    if (data && !error) setItems(data)
  }

  async function handleAdd() {
    if (!selectedItem || quantity <= 0) return
    setLoading(true)

    const supabase = createClient()

    try {
      // Verify stock has enough quantity
      if (selectedItem.quantity < quantity) {
        alert(`Quantidade insuficiente. Disponível: ${selectedItem.quantity}`)
        setLoading(false)
        return
      }

      // Add item to bag
      const { error: addError } = await supabase
        .from('_BagItems')
        .insert({ bagId, stockItemId: selectedItem.id, quantity })

      if (addError) throw addError

      // Subtract from stock
      const newQuantity = selectedItem.quantity - quantity
      const { error: updateError } = await supabase
        .from('StockItem')
        .update({ quantity: newQuantity })
        .eq('id', selectedItem.id)

      if (updateError) throw updateError

      setOpen(false)
      setSelectedItem(null)
      setQuantity(1)
      onAdded?.()
    } catch (err: any) {
      console.error('Erro ao adicionar item:', err)
      alert(`Erro: ${err.message}`)
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

          <div className="pt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium">Item</Label>
              <Select value={selectedItem?.id ?? undefined} onValueChange={(val) => {
                const item = items.find(i => i.id === val)
                setSelectedItem(item || null)
                setQuantity(1)
              }}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Selecione um item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (disponível: {item.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity" className="text-sm font-medium">Quantidade</Label>
              <div className="mt-1">
                <Select value={String(quantity)} onValueChange={(val) => setQuantity(parseInt(val) || 1)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedItem ? 'Selecione a quantidade' : 'Selecione um item para ver o estoque'} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedItem ? (
                      Array.from({ length: selectedItem.quantity }).map((_, i) => {
                        const v = String(i + 1)
                        return (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        )
                      })
                    ) : (
                      <SelectItem value="1">1</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{selectedItem ? `Máximo disponível: ${selectedItem.quantity}` : 'Selecione um item para ver o estoque'}</p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={loading || !selectedItem || quantity <= 0}>
              {loading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
