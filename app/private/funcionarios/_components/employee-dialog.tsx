'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatPhone, formatCPF } from '@/utils/formatPhone'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/utils/supabase/client'
import { ProductImageUploader } from '@/app/private/produtos/_components/product-image-uploader'

type Employee = {
  id: string
  name: string
  email: string
  phone?: string
  cpf?: string
  position: string
  department?: string
  hire_date: string
  salary?: number
  status: 'active' | 'inactive' | 'on_leave'
  address?: string
  city?: string
  state?: string
  zip_code?: string
  birth_date?: string
  emergency_contact?: string
  emergency_phone?: string
  notes?: string
  work_start?: string
  work_end?: string
  lunch_start?: string
  lunch_end?: string
  break_intervals?: string
  image_url?: string | null
}

interface EmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
  onClose: () => void
  onSaved: () => void
}

export function EmployeeDialog({
  open,
  onOpenChange,
  employee,
  onClose,
  onSaved,
}: EmployeeDialogProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    position: '',
    department: '',
    hire_date: new Date().toISOString().split('T')[0],
    salary: '',
    status: 'active' as 'active' | 'inactive' | 'on_leave',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    birth_date: '',
    emergency_contact: '',
    emergency_phone: '',
    notes: '',
    // Horários de trabalho
    work_start: '08:00',
    work_end: '18:00',
    lunch_start: '12:00',
    lunch_end: '13:00',
    break_intervals: '[]',
    image_url: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone || '',
        cpf: employee.cpf || '',
        position: employee.position,
        department: employee.department || '',
        hire_date: employee.hire_date,
        salary: employee.salary ? String(employee.salary) : '',
        status: employee.status,
        address: employee.address || '',
        city: employee.city || '',
        state: employee.state || '',
        zip_code: employee.zip_code || '',
        birth_date: employee.birth_date || '',
        emergency_contact: employee.emergency_contact || '',
        emergency_phone: employee.emergency_phone || '',
        notes: employee.notes || '',
        work_start: employee.work_start || '08:00',
        work_end: employee.work_end || '18:00',
        lunch_start: employee.lunch_start || '12:00',
        lunch_end: employee.lunch_end || '13:00',
        break_intervals: employee.break_intervals || '[]',
        image_url: employee.image_url || ''
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        position: '',
        department: '',
        hire_date: new Date().toISOString().split('T')[0],
        salary: '',
        status: 'active',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        birth_date: '',
        emergency_contact: '',
        emergency_phone: '',
        notes: '',
        work_start: '08:00',
        work_end: '18:00',
        lunch_start: '12:00',
        lunch_end: '13:00',
        break_intervals: '[]',
        image_url: ''
      })
    }
    setErrors({})
  }, [employee, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Cargo é obrigatório'
    }

    if (!formData.hire_date) {
      newErrors.hire_date = 'Data de admissão é obrigatória'
    }

    if (formData.salary && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Salário deve ser um número válido'
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
        email: formData.email,
        phone: formData.phone || null,
        cpf: formData.cpf || null,
        position: formData.position,
        department: formData.department || null,
        hire_date: formData.hire_date,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        status: formData.status,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        birth_date: formData.birth_date || null,
        emergency_contact: formData.emergency_contact || null,
        emergency_phone: formData.emergency_phone || null,
        notes: formData.notes || null,
        work_start: formData.work_start,
        work_end: formData.work_end,
        lunch_start: formData.lunch_start,
        lunch_end: formData.lunch_end,
        break_intervals: formData.break_intervals,
        image_url: formData.image_url || null
      }

      if (employee) {
        // Update
        const { error } = await supabase
          .from('employees')
          .update(payload)
          .eq('id', employee.id)

        if (error) throw error
        toast.success('Funcionário atualizado com sucesso')
      } else {
        // Create
        const { error } = await supabase.from('employees').insert([payload])

        if (error) throw error
        toast.success('Funcionário criado com sucesso')
      }

      onSaved()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar funcionário'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
          <DialogDescription>
            {employee
              ? 'Atualize as informações do funcionário'
              : 'Registre um novo funcionário no sistema'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2"
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value)
                    setFormData({ ...formData, phone: formatted })
                  }}
                  className="mt-2"
                  maxLength={15}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* CPF */}
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value)
                      setFormData({ ...formData, cpf: formatted })
                    }}
                    className="mt-2"
                    maxLength={14}
                  />
                </div>

                {/* Birth Date */}
                <div>
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Position */}
                <div>
                  <Label htmlFor="position">Cargo *</Label>
                  <Input
                    id="position"
                    placeholder="Ex: Recepcionista"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="mt-2"
                    aria-invalid={!!errors.position}
                  />
                  {errors.position && <p className="text-sm text-red-500 mt-1">{errors.position}</p>}
                </div>

                {/* Department */}
                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    placeholder="Ex: Administrativo"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Image */}
              {formData.name && (
                <div>
                  <Label>Foto do Funcionário</Label>
                  <ProductImageUploader 
                    onUpload={(url) => setFormData({ ...formData, image_url: url })}
                    currentImage={formData.image_url}
                    itemName={formData.name}
                    itemType="professional"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Hire Date */}
                <div>
                  <Label htmlFor="hire_date">Data de Admissão *</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    className="mt-2"
                    aria-invalid={!!errors.hire_date}
                  />
                  {errors.hire_date && <p className="text-sm text-red-500 mt-1">{errors.hire_date}</p>}
                </div>

                {/* Salary */}
                <div>
                  <Label htmlFor="salary">Salário (R$)</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="0.00"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="mt-2"
                    aria-invalid={!!errors.salary}
                    step="0.01"
                    min="0"
                  />
                  {errors.salary && <p className="text-sm text-red-500 mt-1">{errors.salary}</p>}
                </div>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'on_leave' })}
                >
                  <SelectTrigger id="status" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="on_leave">Em Licença</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Horários de Trabalho */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Horários de Trabalho</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="work_start">Início do Expediente</Label>
                    <Input
                      id="work_start"
                      type="time"
                      value={formData.work_start}
                      onChange={(e) => setFormData({ ...formData, work_start: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="work_end">Fim do Expediente</Label>
                    <Input
                      id="work_end"
                      type="time"
                      value={formData.work_end}
                      onChange={(e) => setFormData({ ...formData, work_end: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="lunch_start">Início do Almoço</Label>
                    <Input
                      id="lunch_start"
                      type="time"
                      value={formData.lunch_start}
                      onChange={(e) => setFormData({ ...formData, lunch_start: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lunch_end">Fim do Almoço</Label>
                    <Input
                      id="lunch_end"
                      type="time"
                      value={formData.lunch_end}
                      onChange={(e) => setFormData({ ...formData, lunch_end: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="break_intervals">Intervalos (JSON)</Label>
                  <Textarea
                    id="break_intervals"
                    placeholder='[{"start": "10:00", "end": "10:15", "name": "Intervalo"}]'
                    value={formData.break_intervals}
                    onChange={(e) => setFormData({ ...formData, break_intervals: e.target.value })}
                    className="mt-2"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formato JSON para múltiplos intervalos. Deixe [] se não houver intervalos.
                  </p>
                </div>
              </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : employee ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
      </DialogContent>
    </Dialog>
  )
}
