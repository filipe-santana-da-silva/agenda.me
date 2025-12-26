'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { formatPhone } from '@/utils/formatPhone'
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

type Customer = {
  id: string
  name: string
  phone: string
  created_at: string
}

interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onClose: () => void
  onSaved: () => void
}

export function ClientDialog({
  open,
  onOpenChange,
  customer,
  onClose,
  onSaved,
}: ClientDialogProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '' })
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})

  useEffect(() => {
    if (customer) {
      setFormData({ name: customer.name, phone: customer.phone })
    } else {
      setFormData({ name: '', phone: '' })
    }
    setErrors({})
  }, [customer, open])

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (!/^[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Telefone inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      if (customer) {
        // Update
        const { error } = await supabase
          .from('customers')
          .update({ name: formData.name, phone: formData.phone })
          .eq('id', customer.id)

        if (error) throw error
        toast.success('Cliente atualizado com sucesso')
      } else {
        // Create
        const { error } = await supabase.from('customers').insert([
          {
            name: formData.name,
            phone: formData.phone,
          },
        ])

        if (error) {
          if (error.code === '23505') {
            setErrors({ phone: 'Este telefone já está cadastrado' })
            return
          }
          throw error
        }
        toast.success('Cliente criado com sucesso')
      }

      onSaved()
    } catch (err: unknown) {
      const errorMessage = (err as Record<string, unknown>)?.message as string | undefined
      toast.error(errorMessage || 'Erro ao salvar cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {customer ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? 'Atualize as informações do cliente'
              : 'Preencha os dados para cadastrar um novo cliente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-2"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value)
                setFormData({ ...formData, phone: formatted })
              }}
              className="mt-2"
              aria-invalid={!!errors.phone}
              maxLength={15}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
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
              {loading ? 'Salvando...' : customer ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
