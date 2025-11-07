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
  specialty: string
  specialtylevel: number
  rg: string
  cpf: string
  phone: string
  address: string
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
        specialty: specialties.includes(editingRecreator.specialty as any)
          ? editingRecreator.specialty as (typeof specialties)[number]
          : 'palhaço',
        specialtylevel: editingRecreator.specialtylevel,
        rg: editingRecreator.rg,
        cpf: editingRecreator.cpf,
        phone: editingRecreator.phone,
        address: editingRecreator.address,
        notes: editingRecreator.notes,
        availabledays: Array.isArray(editingRecreator.availabledays)
          ? editingRecreator.availabledays
          : typeof editingRecreator.availabledays === 'string'
            ? editingRecreator.availabledays.split(',').map((d) => d.trim())
            : [],
      }
    : undefined

  return (
    <>
      <section className="mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl md:text-2xl font-bold">Recreadores</CardTitle>

            <div className="relative w-full mx-24">
              <Input
                className="w-full pr-10 pl-4 py-2 font-semibold text-xl"
                placeholder="Pesquise um recreador aqui..."
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
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
              {recreadores.map((recreator) => (
                <article
                  key={recreator.id}
                  className="flex items-center justify-between border-b py-2"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                    <span className="font-semibold text-base">
                      {recreator.name} - {recreator.phone} - {recreator.specialty} 
                    </span>

                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-xl ${
                            recreator.specialtylevel >= star ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <ViewRecreatorModal recreador={recreator} onClose={() => {}} />
                      </DialogContent>
                    </Dialog>

                    <Button variant="ghost" size="icon" onClick={() => handleEdit(recreator)}>
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Dialog open={!!editingRecreator} onOpenChange={() => setEditingRecreator(null)}>
                      <DialogContent>
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
