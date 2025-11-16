"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Trash2, Edit2 } from 'lucide-react'

interface Props {
  bagId: string
  number: number
  onAdded?: () => void
}

export function MalaCard({ bagId, number, onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<{ name: string; quantity: number; stockItemId: string }[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [stockItems, setStockItems] = useState<{ id: string; name: string; quantity?: number }[]>([])
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [editingQuantity, setEditingQuantity] = useState(1)
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
      .select('quantity, stockItemId, stockItem:stockItemId (name)')
      .eq('bagId', bagId)

    if (error) {
      console.error('Erro ao buscar itens da mala:', error.message)
      return
    }

    if (data) {
      const formatted = data.map((entry: any) => ({
        name: entry.stockItem?.name,
        quantity: entry.quantity ?? 1,
        stockItemId: entry.stockItemId,
      }))
      setItems(formatted)
    }
  }

  async function fetchStockItems() {
    const { data, error } = await supabase.from('StockItem').select('id, name, quantity')
    if (error) {
      console.error('Erro ao buscar StockItems:', error.message)
      return
    }
    if (data) setStockItems(data)
  }

  async function handleAddItem() {
    if (!selectedItem) return

    // find selected stock item quantity
    const stock = stockItems.find((s) => s.id === selectedItem)
    const qtyToAdd = Math.max(1, Math.min(quantity, stock?.quantity ?? quantity))

    try {
      const { error: addError } = await supabase
        .from('_BagItems')
        .insert({ bagId, stockItemId: selectedItem, quantity: qtyToAdd })

      if (addError) throw addError

      // Subtract from stock
      const newStockQty = (stock?.quantity ?? 0) - qtyToAdd
      const { error: updateError } = await supabase
        .from('StockItem')
        .update({ quantity: newStockQty })
        .eq('id', selectedItem)

      if (updateError) throw updateError

      setSelectedItem('')
      setQuantity(1)
      setDialogOpen(false)
      fetchItems()
      onAdded?.()
    } catch (err: any) {
      console.error('Erro ao adicionar item à mala:', err.message || err)
    }
  }

  async function handleDeleteItem(index: number) {
    const item = items[index]
    if (!confirm(`Tem certeza que deseja remover ${item.name}?`)) return

    try {
      // Ensure we have the stockItemId. If missing, try to resolve by name/quantity.
      let stockItemId = item.stockItemId
      if (!stockItemId) {
        const { data: bagEntries, error: fetchError } = await supabase
          .from('_BagItems')
          .select('stockItemId, quantity, stockItem:stockItemId (name)')
          .eq('bagId', bagId)

        if (fetchError) throw fetchError

        const match = (bagEntries || []).find((b: any) => b.stockItem?.name === item.name)
        if (!match) {
          alert('Não foi possível localizar o item no banco de dados para exclusão.')
          return
        }

        stockItemId = match.stockItemId
      }

      // Delete the bag item by composite key (bagId + stockItemId)
      const { error: deleteError } = await supabase
        .from('_BagItems')
        .delete()
        .eq('bagId', bagId)
        .eq('stockItemId', stockItemId)

      if (deleteError) throw deleteError

      // Return quantity to stock: fetch current stock then update
      const { data: stockData, error: stockFetchError } = await supabase
        .from('StockItem')
        .select('quantity')
        .eq('id', stockItemId)
        .limit(1)

      if (stockFetchError) throw stockFetchError

      const currentStock = (stockData && stockData[0] && stockData[0].quantity) ?? 0
      const newStockQty = currentStock + item.quantity

      const { error: updateError } = await supabase
        .from('StockItem')
        .update({ quantity: newStockQty })
        .eq('id', stockItemId)

      if (updateError) throw updateError

      fetchItems()
    } catch (err: any) {
      console.error('Erro ao remover item:', err.message || err)
      alert('Erro ao remover item: ' + (err.message || 'Tente novamente'))
    }
  }

  async function handleEditItem(index: number) {
    const item = items[index]
    setEditingItemIndex(index)
    setEditingQuantity(item.quantity)
  }

  async function handleSaveEditItem() {
    if (editingItemIndex === null || editingQuantity <= 0) return

    const item = items[editingItemIndex]
    const quantityDiff = editingQuantity - item.quantity

    try {
      // Ensure we have the stockItemId
      const stockItemId = item.stockItemId
      if (!stockItemId) {
        alert('Não foi possível resolver o item para edição.')
        return
      }

      // Update bag item quantity by composite key
      const { error: updateError } = await supabase
        .from('_BagItems')
        .update({ quantity: editingQuantity })
        .eq('bagId', bagId)
        .eq('stockItemId', stockItemId)

      if (updateError) throw updateError

      // Update stock (subtract if increasing, add if decreasing)
      const { data: stockData, error: stockFetchError } = await supabase
        .from('StockItem')
        .select('quantity')
        .eq('id', stockItemId)
        .limit(1)

      if (stockFetchError) throw stockFetchError

      const currentStock = (stockData && stockData[0] && stockData[0].quantity) ?? 0
      const newStockQty = currentStock - quantityDiff

      const { error: stockUpdateError } = await supabase
        .from('StockItem')
        .update({ quantity: newStockQty })
        .eq('id', stockItemId)

      if (stockUpdateError) throw stockUpdateError

      setEditingItemIndex(null)
      fetchItems()
    } catch (err: any) {
      console.error('Erro ao editar quantidade:', err.message || err)
      alert('Erro ao editar quantidade: ' + (err.message || 'Tente novamente'))
    }
  }

  async function handleDeleteBag() {
    if (!confirm('Tem certeza que deseja excluir esta mala? Todos os agendamentos e registros associados também serão excluídos.')) return

    try {
      // Get all appointments for this bag to delete their ranking records
      const { data: appointments, error: fetchError } = await supabase
        .from('Appointment')
        .select('id')
        .eq('bagid', bagId)

      if (fetchError) throw fetchError

      // Delete RankingEventDetail records for each appointment
      if (appointments && appointments.length > 0) {
        const appointmentIds = appointments.map((a: any) => a.id)
        const { error: deleteRankingError } = await supabase
          .from('RankingEventDetail')
          .delete()
          .in('appointmentid', appointmentIds)

        if (deleteRankingError) throw deleteRankingError
      }

      // Delete all appointments associated with this bag
      const { error: deleteApptsError } = await supabase
        .from('Appointment')
        .delete()
        .eq('bagid', bagId)

      if (deleteApptsError) throw deleteApptsError

      // Delete all items in the bag
      const { error: deleteItemsError } = await supabase
        .from('_BagItems')
        .delete()
        .eq('bagId', bagId)

      if (deleteItemsError) throw deleteItemsError

      // Delete the bag
      const { error: deleteBagError } = await supabase
        .from('Bag')
        .delete()
        .eq('id', bagId)

      if (deleteBagError) throw deleteBagError

      onAdded?.()
    } catch (err: any) {
      console.error('Erro ao excluir mala:', err.message || err)
      alert('Erro ao excluir mala: ' + (err.message || 'Tente novamente'))
    }
  }

  return (
    <>
      <Card className="border-2 border-amber-800 shadow-md hover:shadow-lg transition-shadow bg-linear-to-br from-amber-50 to-orange-50">
        <CardHeader className="pb-3 bg-amber-100 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-bold text-amber-900">Mala {number}</CardTitle>
              <Badge variant="secondary" className="text-xs bg-amber-700 text-white">{items.length} itens</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(!open)}
                className="text-amber-800 hover:bg-amber-200"
              >
                {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteBag}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {open && (
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <div key={index}>
                    {editingItemIndex === index ? (
                      <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50 border border-blue-200">
                        <span className="text-sm font-medium text-amber-900 flex-1">{item.name}</span>
                        <Input
                          type="number"
                          min={1}
                          value={editingQuantity}
                          onChange={(e) => setEditingQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 h-8"
                        />
                        <Button size="sm" onClick={handleSaveEditItem} className="bg-green-600 hover:bg-green-700 text-white">Salvar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingItemIndex(null)}>Cancelar</Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 rounded-md bg-amber-50 border border-amber-200">
                        <span className="text-sm font-medium text-amber-900">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-amber-600 text-white border-amber-700">
                            x{item.quantity}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => handleEditItem(index)} className="text-blue-600 hover:bg-blue-50 p-1">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteItem(index)} className="text-red-600 hover:bg-red-50 p-1">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-amber-700 italic">Nenhum item adicionado</p>
              )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full text-amber-800 border-amber-300 hover:bg-amber-100 font-medium">
                  + Adicionar item
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        )}
      </Card>

      {/* Modal for adding item */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogTitle>Adicionar item à mala</DialogTitle>
          <div className="pt-2 space-y-4">
            <div>
              <Label className="text-sm">Item</Label>
              <select value={selectedItem} onChange={(e) => {
                setSelectedItem(e.target.value)
                setQuantity(1)
              }} className="w-full border rounded px-3 py-2 mt-1">
                <option value="">Selecione um item</option>
                {stockItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.name} (disponível: {item.quantity})</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="quantity" className="text-sm">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={selectedItem ? stockItems.find((s) => s.id === selectedItem)?.quantity : undefined}
                value={quantity}
                onChange={(e) => {
                  const raw = parseInt(e.target.value) || 1
                  const stock = stockItems.find((s) => s.id === selectedItem)
                  const max = stock?.quantity ?? raw
                  const v = Math.max(1, Math.min(max, raw))
                  setQuantity(v)
                }}
                className="w-full mt-1"
                disabled={!selectedItem}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {selectedItem ? `Máximo disponível: ${stockItems.find(s => s.id === selectedItem)?.quantity ?? '-'}` : 'Selecione um item para habilitar a quantidade'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={handleAddItem} className="flex-1" disabled={!selectedItem || quantity <= 0}>Adicionar</Button>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
