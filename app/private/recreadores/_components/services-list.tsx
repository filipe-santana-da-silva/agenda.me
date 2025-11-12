'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Pencil, Plus, X, Eye, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { DialogService } from './dialog-service'
import { deleteRecreator } from '../_actions/delete-recreator'
import { DialogRecreatorFormData } from './dialog-recreator-form'
import { ViewRecreatorModal } from './ViewRecreatorModal'

export interface Recreator {
  id: string
  name: string
  // New skills object containing level (0-5) for each specialty
  skills?: {
    recreacao: number
    pintura: number
    balonismo: number
    oficina: number
  }
  rg: string
  cpf: string
  phone: string
  address: string
  pixKey?: string | null
  uniformSize?: string | null
  notes: string
  availabledays: string | string[]
  createdat?: string
  updatedat?: string
}

interface RecreatorListProps {
  recreadores: Recreator[]
}

const specialties = ['palhaço', 'animador', 'pintura facial'] as const

export function RecreatorList({ recreadores }: RecreatorListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecreator, setEditingRecreator] = useState<Recreator | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleEdit = (recreator: Recreator) => {
    setEditingRecreator(recreator)
  }

  const handleDelete = async (recreatorId: string) => {
    const response = await deleteRecreator({ recreadorId: recreatorId })

    if (response.error) {
      toast.error(response.error)
    } else {
      toast.success(response.data)
    }
  }

  const safeInitialValues: DialogRecreatorFormData | undefined = editingRecreator
    ? {
        name: editingRecreator.name,
        // map existing skills or fallback from legacy specialty/specialtylevel
        skills: (editingRecreator as any).skills ?? (() => {
          const s: any = { recreacao: 0, pintura: 0, balonismo: 0, oficina: 0 }
          const legacySpec = (editingRecreator as any).specialty
          const legacyLevel = (editingRecreator as any).specialtylevel ?? 0
          if (legacySpec && typeof legacyLevel === 'number') {
            const key = legacySpec.toString().toLowerCase()
            if (key.includes('pintura')) s.pintura = legacyLevel
            else if (key.includes('balon')) s.balonismo = legacyLevel
            else if (key.includes('oficina')) s.oficina = legacyLevel
            else s.recreacao = legacyLevel
          }
          return s
        })(),
        rg: editingRecreator.rg,
        cpf: editingRecreator.cpf,
        phone: editingRecreator.phone,
  pixKey: (editingRecreator as any).pixKey ?? '',
  uniformSize: (editingRecreator as any).uniformSize ?? undefined,
        address: editingRecreator.address,
        notes: editingRecreator.notes,
        availabledays: Array.isArray(editingRecreator.availabledays)
          ? editingRecreator.availabledays
          : typeof editingRecreator.availabledays === 'string'
            ? editingRecreator.availabledays.split(',').map((d) => d.trim())
            : [],
      }
    : undefined

  const filteredRecreators = (() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return recreadores

    return recreadores.filter((r) => {
      const skillsText = Object.entries(r.skills ?? { recreacao:0, pintura:0, balonismo:0, oficina:0 })
        .map(([k,v]) => `${k} ${v}`)
        .join(' ')

      const hay = [
        r.name,
        r.phone,
        skillsText,
        r.address,
        r.pixKey ?? '',
        r.uniformSize ?? '',
        r.notes ?? '',
        r.rg ?? '',
        r.cpf ?? '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return hay.includes(q)
    })
  })()

  return (
    <>
      <section className="mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-lg md:text-xl font-bold">Recreadores</CardTitle>

            <div className="relative w-full mx-4">
              <Input
                className="w-full pr-8 pl-3 py-1 font-medium text-lg"
                placeholder="Pesquise um recreador aqui..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-auto">
                <DialogService
                  closeModal={() => setIsDialogOpen(false)}
                  recreadorId={undefined}
                  initialValues={undefined}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
 
          <CardContent>
            <section className="space-y-4 mt-5">
              {filteredRecreators.map((recreator) => (
                <article
                  key={recreator.id}
                  className="flex items-center justify-between border-b py-2"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base">{recreator.name}</span>
                        <span className="text-sm text-muted-foreground">{recreator.phone}</span>
                      </div>

                      {/* compact top-skill badge */}
                      {(() => {
                        const skills = recreator.skills ?? { recreacao: 0, pintura: 0, balonismo: 0, oficina: 0 }
                        const entries = Object.entries(skills) as [string, number][]
                        const top = entries.reduce((acc, cur) => (cur[1] > acc[1] ? cur : acc), entries[0])
                        const label = top ? top[0] : 'recreacao'
                        const level = top ? top[1] : 0
                        return (
                          <div className="flex items-center gap-2 ml-2">
                            <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs capitalize">{label}</span>
                            <div className="flex">
                              {[1,2,3,4,5].map((star) => (
                                <span key={star} className={`text-sm ${level >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[80vh] overflow-auto">
                        <ViewRecreatorModal recreador={recreator} onClose={() => {}} />
                      </DialogContent>
                    </Dialog>

                    <Button variant="ghost" size="icon" onClick={() => handleEdit(recreator)}>
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Dialog open={!!editingRecreator} onOpenChange={() => setEditingRecreator(null)}>
                      <DialogContent className="max-h-[80vh] overflow-auto">
                          {editingRecreator && (
                            <DialogService
                              closeModal={() => setEditingRecreator(null)}
                              recreadorId={editingRecreator.id}
                              initialValues={safeInitialValues}
                            />
                          )}
                        </DialogContent>
                    </Dialog>

                    <Button variant="ghost" size="icon" onClick={() => handleDelete(recreator.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </section>
          </CardContent>
        </Card>
      </section>
    </>
  )
}
