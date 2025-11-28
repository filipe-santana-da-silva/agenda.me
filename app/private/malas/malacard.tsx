"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Trash2, Edit2, RotateCw } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  bagId: string
  number: number
  name?: string
  onAdded?: () => void
}

export function MalaCard({ bagId, number, name, onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<{ name: string; quantity: number; stockItemId: string }[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [stockItems, setStockItems] = useState<{ id: string; name: string; quantity?: number }[]>([])
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [editingQuantity, setEditingQuantity] = useState(1)
  const [returnIndex, setReturnIndex] = useState<number | null>(null)
  const [returnAmount, setReturnAmount] = useState<number>(1)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [editingBagName, setEditingBagName] = useState(false)
  const [bagName, setBagName] = useState(name || '')
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
    if (data) {
      const safe = data.map((d: any) => ({ ...d, quantity: Math.max(0, d.quantity ?? 0) }))
      setStockItems(safe)
    }
  }

  async function handleAddItem() {
    if (!selectedItem) return

    // find selected stock item quantity
    const stock = stockItems.find((s) => s.id === selectedItem)
    const available = stock?.quantity ?? 0

    // Do not allow adding if nothing is available
    if (available <= 0) {
      alert(`Quantidade insuficiente. Disponível: ${available}`)
      return
    }

    const qtyToAdd = Math.max(1, Math.min(quantity, available))

    try {
      const { error: addError } = await supabase
        .from('_BagItems')
        .insert({ bagId, stockItemId: selectedItem, quantity: qtyToAdd })

      if (addError) throw addError

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

  async function handleReturnItem(index: number) {
    const item = items[index]
    if (!confirm(`Deseja devolver ${item.name} (x${item.quantity}) para o estoque?`)) return

    try {
      // Ensure we have the stockItemId. If missing, try to resolve by name/quantity.
      let stockItemId = item.stockItemId
      if (!stockItemId) {
        const { data: bagEntries, error: fetchError } = await supabase
          .from('_BagItems')
          .select('stockItemId, quantity, stockItem:stockItemId (name)')
          .eq('bagId', bagId)

        if (fetchError) throw fetchError

        const match = (bagEntries || []).find((b: any) => b.stockItem?.name === item.name && b.quantity === item.quantity)
        if (!match) {
          alert('Não foi possível localizar o item no banco de dados para devolver ao estoque.')
          return
        }

        stockItemId = match.stockItemId
      }

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

      // Delete the bag item
      const { error: deleteError } = await supabase
        .from('_BagItems')
        .delete()
        .eq('bagId', bagId)
        .eq('stockItemId', stockItemId)

      if (deleteError) throw deleteError

      fetchItems()
      onAdded?.()
      try {
        toast.success(`Devolvido ${item.quantity} ${item.quantity > 1 ? 'itens' : 'item'} para o estoque`)
      } catch (e) {
        // swallow toast errors
      }
    } catch (err: any) {
      console.error('Erro ao devolver item ao estoque:', err.message || err)
      alert('Erro ao devolver item ao estoque: ' + (err.message || 'Tente novamente'))
    }
  }

  async function handleConfirmPartialReturn(index: number) {
    const item = items[index]
    const amount = Math.max(1, Math.min(returnAmount, item.quantity))
    if (!confirm(`Confirmar devolução de ${amount} de ${item.name} para o estoque?`)) return

    try {
      // Resolve stockItemId if missing
      let stockItemId = item.stockItemId
      if (!stockItemId) {
        const { data: bagEntries, error: fetchError } = await supabase
          .from('_BagItems')
          .select('stockItemId, quantity, stockItem:stockItemId (name)')
          .eq('bagId', bagId)

        if (fetchError) throw fetchError

        const match = (bagEntries || []).find((b: any) => b.stockItem?.name === item.name)
        if (!match) {
          alert('Não foi possível localizar o item no banco de dados para devolver ao estoque.')
          return
        }

        stockItemId = match.stockItemId
      }

      // Update stock
      const { data: stockData, error: stockFetchError } = await supabase
        .from('StockItem')
        .select('quantity')
        .eq('id', stockItemId)
        .limit(1)

      if (stockFetchError) throw stockFetchError

      const currentStock = (stockData && stockData[0] && stockData[0].quantity) ?? 0
      const newStockQty = currentStock + amount

      const { error: updateError } = await supabase
        .from('StockItem')
        .update({ quantity: newStockQty })
        .eq('id', stockItemId)

      if (updateError) throw updateError

      // Update bag item quantity (subtract amount). If becomes <=0, delete it.
      const { data: bagEntries, error: bagFetchError } = await supabase
        .from('_BagItems')
        .select('quantity')
        .eq('bagId', bagId)
        .eq('stockItemId', stockItemId)
        .limit(1)

      if (bagFetchError) throw bagFetchError

      const bagQty = (bagEntries && bagEntries[0] && bagEntries[0].quantity) ?? item.quantity
      const newBagQty = bagQty - amount

      if (newBagQty > 0) {
        const { error: updateBagError } = await supabase
          .from('_BagItems')
          .update({ quantity: newBagQty })
          .eq('bagId', bagId)
          .eq('stockItemId', stockItemId)

        if (updateBagError) throw updateBagError
      } else {
        const { error: deleteError } = await supabase
          .from('_BagItems')
          .delete()
          .eq('bagId', bagId)
          .eq('stockItemId', stockItemId)

        if (deleteError) throw deleteError
      }

      setReturnIndex(null)
      setReturnAmount(1)
      setReturnDialogOpen(false)
      fetchItems()
      onAdded?.()
      try {
        toast.success(`Devolvido ${amount} ${amount > 1 ? 'itens' : 'item'} para o estoque`)
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      console.error('Erro ao devolver parcialmente item ao estoque:', err.message || err)
      alert('Erro ao devolver item ao estoque: ' + (err.message || 'Tente novamente'))
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

      // Read current stock first so we can validate before applying updates
      const { data: stockData, error: stockFetchError } = await supabase
        .from('StockItem')
        .select('quantity')
        .eq('id', stockItemId)
        .limit(1)

      if (stockFetchError) throw stockFetchError

      const currentStock = (stockData && stockData[0] && stockData[0].quantity) ?? 0

      // If increasing the bag quantity, ensure there's enough stock available
      if (quantityDiff > 0 && currentStock < quantityDiff) {
        alert(`Quantidade insuficiente em estoque. Disponível: ${currentStock}`)
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

  async function handleSaveBagName() {
    if (!bagName.trim()) {
      alert('O nome da mala não pode estar vazio')
      return
    }

    try {
      const { error } = await supabase
        .from('Bag')
        .update({ name: bagName.trim() })
        .eq('id', bagId)

      if (error) throw error

      setEditingBagName(false)
      toast.success('Nome da mala atualizado com sucesso!')
      onAdded?.()
    } catch (err: any) {
      console.error('Erro ao salvar nome da mala:', err.message || err)
      toast.error('Erro ao salvar nome da mala: ' + (err.message || 'Tente novamente'))
    }
  }

  return (
    <>
      <Card className="border-2 border-amber-800 shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-[1.01] motion-reduce:transform-none bg-linear-to-br from-amber-50 to-orange-50">
        <CardHeader className="pb-3 bg-amber-100 border-b border-amber-200">
          {editingBagName ? (
            <div className="flex flex-col gap-2">
              <Input
                value={bagName}
                onChange={(e) => setBagName(e.target.value)}
                placeholder="Nome da mala"
                className="text-base font-bold"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveBagName} className="bg-green-600 hover:bg-green-700 text-white">Salvar</Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingBagName(false); setBagName(name || '') }}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg font-bold text-amber-900">{bagName || number}</CardTitle>
                <Badge variant="secondary" className="text-xs bg-amber-700 text-white">{items.length} itens</Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingBagName(true)}
                className="text-amber-800 hover:bg-amber-200 p-2 h-auto"
                title="Editar nome da mala"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <div className="flex justify-between items-start gap-2 px-2 pt-2">
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

        {open && (
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <div key={index}>
                    {editingItemIndex === index ? (
                      <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-md bg-blue-50 border border-blue-200">
                        <span className="text-sm font-medium text-amber-900 flex-1">{item.name}</span>
                        <Input
                          type="number"
                          min={1}
                          value={editingQuantity}
                          onChange={(e) => setEditingQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full sm:w-16 h-8"
                        />
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <Button size="sm" onClick={handleSaveEditItem} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">Salvar</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingItemIndex(null)} className="w-full sm:w-auto">Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 rounded-md bg-amber-50 border border-amber-200">
                        <span className="text-sm font-medium text-amber-900">{item.name}</span>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 justify-start sm:justify-end">
                          <Badge variant="outline" className="bg-amber-600 text-white border-amber-700">
                            x{item.quantity}
                          </Badge>
                          <div className="flex items-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setReturnIndex(index)
                                setReturnAmount(1)
                                setReturnDialogOpen(true)
                              }}
                              className="text-amber-800 hover:bg-amber-100 p-1 w-7 h-7 min-w-0 min-h-0 sm:w-9 sm:h-9"
                              aria-label={`Iniciar devolução parcial de ${item.name}`}
                            >
                              <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditItem(index)}
                            className="text-blue-600 hover:bg-blue-50 p-1 w-7 h-7 min-w-0 min-h-0 sm:w-9 sm:h-9"
                          >
                            <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteItem(index)}
                            className="text-red-600 hover:bg-red-50 p-1 w-7 h-7 min-w-0 min-h-0 sm:w-9 sm:h-9"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
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
              <div className="flex justify-center sm:justify-start">
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto text-amber-800 border-amber-300 hover:bg-amber-100 font-medium">
                    + Adicionar item
                  </Button>
                </DialogTrigger>
              </div>
            </Dialog>
          </CardContent>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar item à mala</DialogTitle>
            <DialogDescription>Escolha um item e a quantidade para adicionar. Contagens iniciam em 1 aqui.</DialogDescription>
          </DialogHeader>

          <div className="pt-2 space-y-4">
            <div>
              <Label className="text-sm">Item</Label>
              <select value={selectedItem} onChange={(e) => {
                setSelectedItem(e.target.value)
                setQuantity(1)
              }} className="w-full border rounded px-3 py-2 mt-1">
                <option value="">Selecione um item</option>
                {stockItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.name} (disponível: {Math.max(0, item.quantity ?? 0)})</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="quantity" className="text-sm">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={selectedItem ? Math.max(0, stockItems.find((s) => s.id === selectedItem)?.quantity ?? 0) : undefined}
                value={quantity}
                onChange={(e) => {
                  const raw = parseInt(e.target.value) || 1
                  const stock = stockItems.find((s) => s.id === selectedItem)
                  const max = Math.max(0, stock?.quantity ?? raw)
                  const v = Math.max(1, Math.min(max, raw))
                  setQuantity(v)
                }}
                className="w-full mt-1"
                disabled={!selectedItem}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {selectedItem ? `Máximo disponível: ${Math.max(0, stockItems.find(s => s.id === selectedItem)?.quantity ?? 0)}` : 'Selecione um item para habilitar a quantidade'}
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddItem} className="ml-2" disabled={!selectedItem || quantity <= 0}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={returnDialogOpen} onOpenChange={(v) => {
        setReturnDialogOpen(!!v)
        if (!v) setReturnIndex(null)
      }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Devolver item ao estoque</DialogTitle>
              <DialogDescription>Selecione quantos itens deseja devolver para o estoque.</DialogDescription>
            </DialogHeader>

            <div className="pt-2 space-y-4">
              <div>
                <Label className="text-sm">Item</Label>
                <div className="mt-1 text-amber-900 font-medium">{returnIndex !== null ? items[returnIndex]?.name : ''}</div>
              </div>

              <div>
                <Label className="text-sm">Quantidade</Label>
                <select
                  value={String(returnAmount)}
                  onChange={(e) => setReturnAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  {Array.from({ length: returnIndex !== null ? items[returnIndex].quantity : 1 }).map((_, i) => {
                    const v = i + 1
                    return <option key={v} value={String(v)}>{v}</option>
                  })}
                </select>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                onClick={() => { if (returnIndex !== null) handleConfirmPartialReturn(returnIndex) }}
                className="flex-1 bg-amber-600 text-white"
              >
                Devolver
              </Button>
              <Button variant="ghost" onClick={() => { setReturnDialogOpen(false); setReturnIndex(null) }}>Cancelar</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  )
}
