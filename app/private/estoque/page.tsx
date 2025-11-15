'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Pencil1Icon, CheckIcon, Cross1Icon, TrashIcon } from '@radix-ui/react-icons'

interface StockItem {
  id: string
  name: string
  description?: string
  quantity: number
}

export default function EstoquePage() {
  const [items, setItems] = useState<StockItem[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedQuantity, setEditedQuantity] = useState<number>(0)

  const supabase = createClient()

  useEffect(() => {
    fetchStock()
  }, [])

  async function fetchStock() {
    setLoading(true)
    const { data, error } = await supabase.from('StockItem').select('*')
    if (data) setItems(data)
    if (error) console.error('Erro ao buscar estoque:', error.message)
    setLoading(false)
  }

  async function handleAddItem() {
    if (!name.trim()) return

    const { error } = await supabase
      .from('StockItem')
      .insert({ name, description, quantity })

    if (!error) {
      setName('')
      setDescription('')
      setQuantity(1)
      fetchStock()
    }
  }

  async function handleSaveQuantity(id: string) {
    const { error } = await supabase
      .from('StockItem')
      .update({ quantity: editedQuantity })
      .eq('id', id)

    if (!error) {
      setEditingId(null)
      setEditedQuantity(0)
      fetchStock()
    }
  }

  async function handleDeleteItem(id: string) {
    if (!confirm('Tem certeza que deseja excluir este item do estoque?')) return

    const { error } = await supabase.from('StockItem').delete().eq('id', id)
    if (!error) {
      fetchStock()
    } else {
      console.error('Erro ao excluir item do estoque:', error.message)
      alert('Erro ao excluir item do estoque.')
    }
  }

  return (
    <div className="w-full min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Estoque</h1>

      <div className="grid grid-cols-3 gap-4 mb-4 w-full">
        <input
          type="text"
          placeholder="PRODUTO"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <input
          type="text"
          placeholder="DESCRIÇÃO"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        <input
          type="number"
          placeholder="QUANTIDADE"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <button
        onClick={handleAddItem}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700 transition"
      >
        + Adicionar item
      </button>

      <table className="w-full border-t">
        <thead>
          <tr className="text-left text-sm text-gray-600">
            <th className="py-2">Produto</th>
            <th className="py-2">Descrição</th>
            <th className="py-2">Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.name}</td>
              <td className="py-2">{item.description}</td>
              <td className="py-2">
                {editingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editedQuantity}
                      onChange={(e) => setEditedQuantity(Number(e.target.value))}
                      className="border rounded px-2 py-1 w-20"
                    />
                    <button
                      onClick={() => handleSaveQuantity(item.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <CheckIcon />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Cross1Icon />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {item.quantity}
                    <button
                      onClick={() => {
                        setEditingId(item.id)
                        setEditedQuantity(item.quantity)
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Pencil1Icon />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Excluir ${item.name}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
