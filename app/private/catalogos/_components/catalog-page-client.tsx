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
import { Pencil, FileText, Download } from 'lucide-react'
import { ImageUploader } from './image-uploader'

type Product = { id: string; name: string; price?: number }
type Service = { id: string; name: string; price?: number }

export default function CatalogPageClient() {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])

  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({})
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({})

  const [catalogs, setCatalogs] = useState<{ id: string; name: string; description?: string; image_url?: string; items: Record<string, unknown>[]; pdf_url?: string }[]>([])
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  
  // Gerar PDF e salvar como base64 no localStorage
  const generateAndSavePDF = async (catalog: Record<string, unknown>) => {
    try {
      setGeneratingPDF(true)
      console.log('📄 Gerando PDF para:', catalog.name)
      
      // Importar jsPDF dinamicamente
      const { jsPDF: jsPDFLib } = await import('jspdf')
      
      // Usar require para tipagem correta
      const doc = new jsPDFLib({
        orientation: 'portrait' as const,
        unit: 'mm' as const,
        format: 'a4' as const,
      })
      
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      let yPos = margin + 10
      
      // Título
      doc.setFontSize(20)
      doc.setTextColor(102, 126, 234)
      doc.text(String(catalog.name), margin, yPos)
      yPos += 12
      
      // Descrição
      if (catalog.description) {
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        const lines = doc.splitTextToSize(String(catalog.description), pageWidth - 2 * margin) as string[]
        doc.text(lines, margin, yPos)
        yPos += lines.length * 4 + 5
      }
      
      // Imagem (se houver)
      if (catalog.image_url) {
        try {
          if (yPos > pageHeight - 60) {
            doc.addPage()
            yPos = margin
          }
          const imgWidth = pageWidth - 2 * margin
          const imgHeight = 60 // altura fixa
          doc.addImage(String(catalog.image_url), 'JPEG', margin, yPos, imgWidth, imgHeight)
          yPos += imgHeight + 5
        } catch {
          console.warn('Aviso: Não foi possível adicionar imagem ao PDF')
        }
      }
      
      // Linha separadora
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 8
      
      // Itens
      const items = catalog.items as Array<Record<string, unknown>>
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          const detail = item.detail as Record<string, unknown>
          
          if (yPos > pageHeight - 20) {
            doc.addPage()
            yPos = margin
          }
          
          // Nome
          doc.setFontSize(12)
          doc.setTextColor(50, 50, 50)
          doc.text(`${i + 1}. ${String(detail?.name || detail?.title || item.item_type)}`, margin, yPos)
          yPos += 6
          
          // Preço
          if (detail?.price) {
            doc.setFontSize(11)
            doc.setTextColor(102, 126, 234)
            doc.text(`R$ ${Number(detail.price).toFixed(2)}`, margin + 5, yPos)
            yPos += 5
          }
          
          // Tipo
          doc.setFontSize(9)
          doc.setTextColor(120, 120, 120)
          doc.text(`Tipo: ${String(item.item_type)}`, margin + 5, yPos)
          yPos += 5
          
          yPos += 3
        }
      }
      
      // Salvar PDF como data URL
      const pdfData = doc.output('dataurlstring')
      
      // Salvar no localStorage
      const storageKey = `catalog_pdf_${catalog.id}`
      localStorage.setItem(storageKey, pdfData as string)
      
      // Tentar salvar no Chrome Storage se disponível
      try {
        const win = typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : null
        if (win && (win.chrome as Record<string, unknown>)?.storage) {
          const chromeStorage = ((win.chrome as Record<string, unknown>).storage as Record<string, unknown>).local as Record<string, unknown>
          const getter = chromeStorage.get as (keys: string[], callback: (result: Record<string, unknown>) => void) => void
          getter(['savedPDFs'], (result: Record<string, unknown>) => {
            const savedPDFs = (result.savedPDFs as Record<string, unknown>) || {}
            ;(savedPDFs as Record<string, unknown>)[catalog.id as string] = {
              name: catalog.name as string,
              data: pdfData,
              timestamp: new Date().toISOString()
            }
            const setter = chromeStorage.set as (items: Record<string, unknown>, callback?: () => void) => void
            setter({ savedPDFs }, () => {
              console.log('✅ PDF salvo no Chrome Storage:', catalog.id)
            })
          })
        }
      } catch (chromeError) {
        console.warn('Chrome Storage não disponível:', chromeError)
      }
      
      // Atualizar catálogos com URL do PDF
      setCatalogs(prev => prev.map(c => 
        c.id === catalog.id ? { ...c, pdf_url: pdfData as string } : c
      ))
      
      toast.success('📄 PDF gerado e salvo com sucesso!')
      console.log('✅ PDF salvo:', catalog.id)
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Verifique o console.')
    } finally {
      setGeneratingPDF(false)
    }
  }

  // Baixar PDF do catálogo
  const downloadPDF = (catalog: Record<string, unknown>) => {
    try {
      const pdfUrl = catalog.pdf_url as string | undefined
      if (!pdfUrl) {
        toast.error(' Gere o PDF primeiro')
        return
      }

      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${String(catalog.name)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(' PDF baixado com sucesso!')
    } catch (error) {
      console.error('Erro ao baixar PDF:', error)
      toast.error('Erro ao baixar PDF')
    }
  }

  const loadData = useCallback(async () => {
    try {
      const [{ data: productsData }, { data: servicesData }] = await Promise.all([
        supabase.from('products').select('id, name, price').order('name'),
        supabase.from('services').select('id, name, price').order('name'),
      ])

      setProducts(productsData || [])
      setServices(servicesData || [])
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
    setImageUrl((catalog.image_url as string) || '')
    
    const prods: Record<string, boolean> = {}
    const servs: Record<string, boolean> = {}
    
    const items = catalog.items as Array<Record<string, unknown>>
    items?.forEach((item) => {
      if (item.item_type === 'product') prods[item.item_id as string] = true
      if (item.item_type === 'service') servs[item.item_id as string] = true
    })
    
    setSelectedProducts(prods)
    setSelectedServices(servs)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingCatalogId(null)
    setName('')
    setDescription('')
    setImageUrl('')
    setSelectedProducts({})
    setSelectedServices({})
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

      if (isEditing && editingCatalogId) {
        const res = await fetch(`/api/catalogs?id=${editingCatalogId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, image_url: imageUrl, items }),
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
          body: JSON.stringify({ name, description, image_url: imageUrl, items }),
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
                {name && <ImageUploader onUpload={setImageUrl} currentImage={imageUrl} catalogName={name} />}
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
                    <div className="flex-1 cursor-pointer flex items-center gap-2" onClick={() => setSelectedCatalogId(c.id as string)}>
                      {(c.pdf_url as string | undefined) && (
                        <FileText className="w-4 h-4 text-blue-500" />
                      )}
                      <div>
                        <div className="font-medium">{c.name as string}</div>
                        <div className="text-xs text-muted-foreground">{c.description as string}</div>
                      </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle>{selectedCatalog ? (selectedCatalog.name as string) : 'Visualização do Catálogo'}</CardTitle>
                    <CardDescription>{selectedCatalog ? (selectedCatalog.description as string) : 'Selecione um catálogo no painel à esquerda ou crie um novo.'}</CardDescription>
                  </div>
                  {selectedCatalog && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => generateAndSavePDF(selectedCatalog)}
                        disabled={generatingPDF}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        {generatingPDF ? '⏳ Gerando...' : '📄 Gerar PDF'}
                      </Button>
                      <Button 
                        onClick={() => downloadPDF(selectedCatalog)}
                        disabled={!selectedCatalog.pdf_url}
                        variant="default"
                        size="sm"
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Baixar PDF
                      </Button>
                    </div>
                  )}
                </div>
            </CardHeader>
            <CardContent>
              {selectedCatalog && selectedCatalog.items && selectedCatalog.items.length > 0 ? (
                <div className="space-y-4">
                  {selectedCatalog.image_url && (
                    <div className="rounded overflow-hidden max-h-96">
                      <Image 
                        src={selectedCatalog.image_url} 
                        alt={selectedCatalog.name as string} 
                        width={600} 
                        height={300} 
                        className="object-cover w-full h-auto max-h-96"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedCatalog.items.map((it: Record<string, unknown>) => {
                      const detail = it.detail as Record<string, unknown>
                      return (
                        <div key={it.id as string} className="border rounded overflow-hidden bg-white dark:bg-slate-800 dark:border-slate-700">
                          <div className="h-36 bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                            {/* try to show thumbnail if available */}
                            {detail?.image_url ? (
                              <Image src={detail.image_url as string} alt={(detail.name as string) || (detail.title as string)} width={320} height={180} className="object-cover w-full h-full max-w-full max-h-full" />
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
