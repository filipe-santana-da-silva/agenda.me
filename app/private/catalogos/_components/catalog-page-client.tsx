'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { Pencil } from 'lucide-react'

type Product = { id: string; name: string; price?: number }
type Service = { id: string; name: string; price?: number }
type Professional = { id: string; name: string; position?: string }

export default function CatalogPageClient() {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])

  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({})
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({})
  const [selectedProfessionals, setSelectedProfessionals] = useState<Record<string, boolean>>({})

  const [catalogs, setCatalogs] = useState<{ id: string; name: string; description?: string; items: Record<string, unknown>[] }[]>([])
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [{ data: productsData }, { data: servicesData }, { data: professionalsData }] = await Promise.all([
        supabase.from('products').select('id, name, price').order('name'),
        supabase.from('services').select('id, name, price').order('name'),
        supabase.from('employees').select('id, name, position').eq('status', 'active').order('name'),
      ])

      setProducts(productsData || [])
      setServices(servicesData || [])
      setProfessionals(professionalsData || [])
    } catch {
      toast.error('Erro ao carregar dados')
    }
  }, [supabase])

  const loadCatalogs = useCallback(async () => {
    try {
      const res = await fetch('/api/catalogs')
      const json = await res.json()
      setCatalogs(json.catalogs || [])
      if (!selectedCatalogId && json.catalogs && json.catalogs.length > 0) {
        setSelectedCatalogId(json.catalogs[0].id)
      }
    } catch {
      // silently fail
    }
  }, [selectedCatalogId])

  useEffect(() => {
    loadData()
    loadCatalogs()
  }, [loadData, loadCatalogs])

  const toggle = (id: string, setState: (state: Record<string, boolean>) => void, state: Record<string, boolean>) => {
    setState({ ...state, [id]: !state[id] })
  }

  const handleEdit = (catalog: Record<string, unknown>) => {
    setIsEditing(true)
    setEditingCatalogId(catalog.id as string)
    setName(catalog.name as string)
    setDescription((catalog.description as string) || '')
    
    const prods: Record<string, boolean> = {}
    const servs: Record<string, boolean> = {}
    const profs: Record<string, boolean> = {}
    
    const items = catalog.items as Array<Record<string, unknown>>
    items?.forEach((item) => {
      if (item.item_type === 'product') prods[item.item_id as string] = true
      if (item.item_type === 'service') servs[item.item_id as string] = true
      if (item.item_type === 'professional') profs[item.item_id as string] = true
    })
    
    setSelectedProducts(prods)
    setSelectedServices(servs)
    setSelectedProfessionals(profs)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingCatalogId(null)
    setName('')
    setDescription('')
    setSelectedProducts({})
    setSelectedServices({})
    setSelectedProfessionals({})
  }

  const handleSave = async () => {
    try {
      if (!name) return toast.error('Defina um nome para o catálogo')

      const items: Array<Record<string, unknown>> = []
      Object.keys(selectedProducts).forEach((k) => {
        if (selectedProducts[k]) items.push({ item_type: 'product', item_id: k })
      })
      Object.keys(selectedServices).forEach((k) => {
        if (selectedServices[k]) items.push({ item_type: 'service', item_id: k })
      })
      Object.keys(selectedProfessionals).forEach((k) => {
        if (selectedProfessionals[k]) items.push({ item_type: 'professional', item_id: k })
      })

      if (isEditing && editingCatalogId) {
        const res = await fetch(`/api/catalogs?id=${editingCatalogId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, items }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Erro ao atualizar catálogo')
        }

        toast.success('Catálogo atualizado com sucesso')
      } else {
        const res = await fetch('/api/catalogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, items }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Erro ao criar catálogo')
        }

        toast.success('Catálogo criado com sucesso')
      }

      handleCancelEdit()
      loadCatalogs()
    } catch (error: unknown) {
      const err = error as Record<string, unknown>
      toast.error((err.message as string) || 'Erro')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/catalogs?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao remover catálogo')
      toast.success('Catálogo removido')
      loadCatalogs()
    } catch (e: unknown) {
      const err = e as Record<string, unknown>
      toast.error((err.message as string) || 'Erro')
    }
  }

  const selectedCatalog = catalogs.find((c) => c.id === selectedCatalogId) || null

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Catálogos</h1>
          <p className="text-muted-foreground">Monte seleções rápidas de produtos, serviços e profissionais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: create + list */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Editar Catálogo' : 'Novo Catálogo'}</CardTitle>
              <CardDescription>Defina um nome e adicione itens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input placeholder="Nome do catálogo" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">{isEditing ? 'Salvar' : 'Criar'}</Button>
                  {isEditing && (
                    <Button onClick={handleCancelEdit} variant="outline" className="flex-1">Cancelar</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itens Disponíveis</CardTitle>
              <CardDescription>Marque itens para incluir no novo catálogo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-75 overflow-y-auto">
                <div className="text-sm font-medium mb-2">Produtos</div>
                {products.map((p) => (
                  <label key={p.id} className="flex items-center justify-between gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={!!selectedProducts[p.id]} onCheckedChange={() => toggle(p.id, setSelectedProducts, selectedProducts)} />
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">R$ {p.price?.toFixed(2)}</div>
                      </div>
                    </div>
                  </label>
                ))}

                <div className="text-sm font-medium mt-3 mb-2">Serviços</div>
                {services.map((s) => (
                  <label key={s.id} className="flex items-center justify-between gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={!!selectedServices[s.id]} onCheckedChange={() => toggle(s.id, setSelectedServices, selectedServices)} />
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">R$ {s.price?.toFixed(2)}</div>
                      </div>
                    </div>
                  </label>
                ))}

                <div className="text-sm font-medium mt-3 mb-2">Profissionais</div>
                {professionals.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded">
                    <Checkbox checked={!!selectedProfessionals[p.id]} onCheckedChange={() => toggle(p.id, setSelectedProfessionals, selectedProfessionals)} />
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.position}</div>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seus Catálogos</CardTitle>
              <CardDescription>Selecione para visualizar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {catalogs.map((c: Record<string, unknown>) => (
                  <div key={c.id as string} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-800">
                    <div className="flex-1 cursor-pointer" onClick={() => setSelectedCatalogId(c.id as string)}>
                      <div className="font-medium">{c.name as string}</div>
                      <div className="text-xs text-muted-foreground">{c.description as string}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id as string)}>
                        <span className="text-red-500">×</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main preview area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{selectedCatalog ? (selectedCatalog.name as string) : 'Visualização do Catálogo'}</CardTitle>
              <CardDescription>{selectedCatalog ? (selectedCatalog.description as string) : 'Selecione um catálogo no painel à esquerda ou crie um novo.'}</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCatalog && selectedCatalog.items && selectedCatalog.items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedCatalog.items.map((it: Record<string, unknown>) => {
                    const detail = it.detail as Record<string, unknown>
                    return (
                      <div key={it.id as string} className="border rounded overflow-hidden bg-white dark:bg-slate-800 dark:border-slate-700">
                        <div className="h-36 bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                          {/* try to show thumbnail if available */}
                          {detail?.image_url ? (
                            <Image src={detail.image_url as string} alt={(detail.name as string) || (detail.title as string)} width={320} height={180} className="object-cover w-full h-full" />
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-slate-400">{((detail?.name as string)?.slice(0, 1) || it.item_type as string)}</div>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="font-medium mb-1">{String((detail?.name) || (detail?.title) || (it.item_type))}</div>
                          <div className="text-xs text-muted-foreground mb-2">{String(it.item_type)}</div>
                          {detail?.price ? <div className="font-semibold">R$ {String(Number(detail.price).toFixed(2))}</div> : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-muted-foreground">Nenhum item no catálogo selecionado.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
