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

type Service = {
  id: string
  name: string
  duration: string
  price: number | null
  created_at?: string
}

interface ServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
  onClose: () => void
  onSaved: () => void
}

export function ServiceDialog({
  open,
  onOpenChange,
  service,
  onClose,
  onSaved,
}: ServiceDialogProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    durationMinutes: '',
    price: '',
  })
  const [errors, setErrors] = useState<{
    name?: string
    durationMinutes?: string
    price?: string
  }>({})

  useEffect(() => {
    if (service) {
      // Parse duration from PostgreSQL interval or time format
      let minutes = ''
      if (service.duration) {
        if (service.duration.includes(':')) {
          const parts = service.duration.split(':')
          const hours = parseInt(parts[0]) || 0
          const mins = parseInt(parts[1]) || 0
          minutes = String(hours * 60 + mins)
        } else if (service.duration.includes('min')) {
          minutes = service.duration.replace(/\D/g, '')
        }
      }

      setFormData({
        name: service.name,
        durationMinutes: minutes,
        price: service.price ? String(service.price) : '',
      })
    } else {
      setFormData({ name: '', durationMinutes: '', price: '' })
    }
    setErrors({})
  }, [service, open])

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.durationMinutes.trim()) {
      newErrors.durationMinutes = 'Duração é obrigatória'
    } else if (isNaN(Number(formData.durationMinutes)) || Number(formData.durationMinutes) <= 0) {
      newErrors.durationMinutes = 'Duração deve ser um número positivo'
    }

    if (formData.price && (isNaN(Number(formData.price)) || Number(formData.price) < 0)) {
      newErrors.price = 'Preço deve ser um número válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      // Convert minutes to PostgreSQL interval format (HH:MM:SS)
      const minutes = parseInt(formData.durationMinutes)
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      const durationInterval = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`

      const payload = {
        name: formData.name,
        duration: durationInterval,
        price: formData.price ? parseFloat(formData.price) : null,
      }

      if (service) {
        // Update
        const { error } = await supabase
          .from('services')
          .update(payload)
          .eq('id', service.id)

        if (error) throw error
        toast.success('Serviço atualizado com sucesso')
      } else {
        // Create
        const { error } = await supabase.from('services').insert([payload])

        if (error) throw error
        toast.success('Serviço criado com sucesso')
      }

      onSaved()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar serviço')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {service ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
          <DialogDescription>
            {service
              ? 'Atualize as informações do serviço'
              : 'Preencha os dados para cadastrar um novo serviço'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Ex: Animação Infantil"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration">Duração (minutos) *</Label>
            <Input
              id="duration"
              type="number"
              placeholder="Ex: 60"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
              className="mt-2"
              aria-invalid={!!errors.durationMinutes}
              min="1"
            />
            {errors.durationMinutes && (
              <p className="text-sm text-red-500 mt-1">{errors.durationMinutes}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price">Preço (opcional)</Label>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-muted-foreground">R$</span>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="flex-1"
                aria-invalid={!!errors.price}
                step="0.01"
                min="0"
              />
            </div>
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">{errors.price}</p>
            )}
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
              {loading ? 'Salvando...' : service ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
