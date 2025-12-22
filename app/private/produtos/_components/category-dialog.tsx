'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Category = {
  id: string
  name: string
  description: string | null
}

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  onClose: () => void
  onSaved: () => void
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onClose,
  onSaved,
}: CategoryDialogProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<{
    name?: string
  }>({})

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
      })
    } else {
      setFormData({
        name: '',
        description: '',
      })
    }
    setErrors({})
  }, [category, open])

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
      }

      if (category) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', category.id)

        if (error) throw error
        toast.success('Categoria atualizada com sucesso')
      } else {
        // Create
        const { error } = await supabase.from('categories').insert([payload])

        if (error) throw error
        toast.success('Categoria criada com sucesso')
      }

      onSaved()
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar categoria')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {category
              ? 'Atualize as informações da categoria'
              : 'Preencha os dados para cadastrar uma nova categoria'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Ex: Produtos de Higiene"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição da categoria"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-2 min-h-20"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : category ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
