'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Plus, X, Eye, Search } from 'lucide-react'
import { toast } from 'sonner'
import { deleteContractor } from '../_actions/delete-service'
import { formatDocumentValue } from '@/utils/formartDocument'

const DialogService = dynamic(() => import('./dialog-service').then(mod => mod.DialogService), { 
  ssr: false,
  loading: () => <div className="p-2 text-sm text-muted-foreground">Carregando...</div> 
})

export interface Contractor {
  id: string
  name: string
  childname: string
  phone: string
  address: string
  maritalstatus?: string | null
  profession?: string | null
  documenttype: string
  documentvalue: string
  createdat?: string
  updatedat?: string
  // optional: pessoa física ou jurídica
  personType?: 'fisica' | 'juridica' | null
}

interface ContractorListProps {
  contractors: Contractor[]
}

export function ContractorList({ contractors }: ContractorListProps) {
  const [contractorList, setContractorList] = useState(contractors)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null)
  const [viewingContractor, setViewingContractor] = useState<Contractor | null>(null)

  const handleEdit = (contractor: Contractor) => {
    setEditingContractor(contractor)
    setIsDialogOpen(true)
  }

  const handleDelete = async (contractorId: string) => {
    if (!confirm('Tem certeza que deseja excluir este contratante?')) return

    const response = await deleteContractor({ contractorId })

    if (response.error) {
      toast.error(response.error)
    } else {
      toast.success(response.data)
      setContractorList(prev => prev.filter(c => c.id !== contractorId)) 
    }
  }

  const filteredContractors = (() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return contractorList

    return contractorList.filter((contractor) => {
      const hay = [
        contractor.name,
        contractor.childname,
        contractor.phone,
        contractor.address,
        contractor.documentvalue,
        contractor.maritalstatus ?? '',
        contractor.profession ?? '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return hay.includes(q)
    })
  })()

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingContractor(null)
        }}
      >
        <section className="flex flex-col gap-6">
          {/* Card de cabeçalho */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl md:text-2xl font-bold">Contratantes</CardTitle>

              <div className="flex items-center w-full max-w-xl mx-auto border rounded-md px-3 py-2 bg-white">
                <Search className="text-muted-foreground w-5 h-5 mr-2" />
                <input
                  type="text"
                  placeholder="Pesquise um contratante aqui..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-none outline-none font-semibold text-xl placeholder:text-muted-foreground"
                />
              </div>

              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
            </CardHeader>
          </Card>

          {/* Card de listagem */}
          <Card>
            <CardContent>
              <section className="space-y-4 mt-2">
                {filteredContractors.map((contractor) => (
                  <article key={contractor.id} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">{contractor.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {contractor.childname} — {contractor.address}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {contractor.phone} • {contractor.documenttype}
                        {contractor.maritalstatus ? ` • ${contractor.maritalstatus}` : ''}
                        {contractor.profession ? ` • ${contractor.profession}` : ''}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewingContractor(contractor)}>
                        <Eye />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(contractor)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(contractor.id)}>
                        <X className="w-8 h-8" />
                      </Button>
                    </div>
                  </article>
                ))}
              </section>
            </CardContent>
          </Card>

          {/* Dialog de edição/criação */}
          <DialogContent
            onInteractOutside={(e) => {
              e.preventDefault()
              setIsDialogOpen(false)
              setEditingContractor(null)
            }}
          >
            <DialogService
              closeModal={() => {
                setIsDialogOpen(false)
                setEditingContractor(null)
              }}
              contractorId={editingContractor?.id}
              initialValues={
                editingContractor
                  ? {
                      personType: (editingContractor as any).personType ?? 'fisica',
                      name: editingContractor.name,
                      childname: editingContractor.childname,
                      phone: editingContractor.phone,
                      maritalstatus: (editingContractor as any).maritalstatus ?? '',
                      profession: (editingContractor as any).profession ?? '',
                      address: editingContractor.address,
                      documenttype: editingContractor.documenttype,
                      documentvalue: editingContractor.documentvalue,
                    }
                  : undefined
              }
              onCreate={(newContractor) => {
                setContractorList(prev => [...prev, newContractor]) // ✅ adiciona novo contratante
                setIsDialogOpen(false)
              }}
            />
          </DialogContent>
        </section>
      </Dialog>

      {/* Dialog de visualização */}
      <Dialog open={!!viewingContractor} onOpenChange={() => setViewingContractor(null)}>
        <DialogContent>
          <DialogTitle className="text-xl font-bold">Detalhes do Contratante</DialogTitle>
          <div className="space-y-2 mt-2">
            <p><strong>Responsável:</strong> {viewingContractor?.name}</p>
            <p><strong>Criança:</strong> {viewingContractor?.childname}</p>
            <p><strong>Telefone:</strong> {viewingContractor?.phone}</p>
            <p><strong>Estado Civil:</strong> {viewingContractor?.maritalstatus ?? '—'}</p>
            <p><strong>Profissão:</strong> {viewingContractor?.profession ?? '—'}</p>
            <p><strong>Endereço:</strong> {viewingContractor?.address}</p>
            <p>
              <strong>Documento:</strong>{' '}
              {viewingContractor?.documenttype} —{' '}
              {formatDocumentValue(viewingContractor?.documenttype ?? '', viewingContractor?.documentvalue ?? '')}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
