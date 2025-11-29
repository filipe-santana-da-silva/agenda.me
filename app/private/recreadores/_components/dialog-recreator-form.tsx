'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Formatting functions
export const formatRG = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`
}

export const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

// Schema com quatro especialidades e nível para cada uma (0-5)
const formSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  // skills: níveis para cada especialidade (0-5)
  skills: z.object({
    recreacao: z.number().min(0).max(5),
    pintura: z.number().min(0).max(5),
    balonismo: z.number().min(0).max(5),
    oficina: z.number().min(0).max(5),
  }),
  rg: z.string().min(1, { message: 'O RG é obrigatório' }),
  cpf: z.string().min(1, { message: 'O CPF é obrigatório' }),
  phone: z.string().min(1, { message: 'O telefone é obrigatório' }),
  address: z.string().min(1, { message: 'O endereço é obrigatório' }),
  pixKey: z.string().optional(),
  uniformSize: z.enum(['PP','P','M','G','GG'] as const).optional(),
  notes: z.string().optional(),
  availabledays: z.array(z.string()).optional(),
  organizer: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // Validate CPF format
  if (data.cpf) {
    const cpfDigits = data.cpf.replace(/\D/g, '')
    if (cpfDigits.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CPF deve conter exatamente 11 dígitos',
        path: ['cpf'],
      })
    }
  }
  
  // Validate RG format (7-9 digits)
  if (data.rg) {
    const rgDigits = data.rg.replace(/\D/g, '')
    if (rgDigits.length < 7 || rgDigits.length > 9) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'RG deve conter de 7 a 9 dígitos',
        path: ['rg'],
      })
    }
  }
})

// ✅ Tipo inferido corretamente
export type DialogRecreatorFormData = z.infer<typeof formSchema>

export interface UseDialogRecreatorFormProps {
  initialValues?: DialogRecreatorFormData
}

// ✅ Hook com resolver e valores padrão
export function useDialogRecreatorForm({ initialValues }: UseDialogRecreatorFormProps) {
  return useForm<DialogRecreatorFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      name: '',
      skills: {
        recreacao: 1,
        pintura: 0,
        balonismo: 0,
        oficina: 0,
      },
      rg: '',
      cpf: '',
      phone: '',
      address: '',
      pixKey: '',
      uniformSize: undefined,
      notes: '',
      availabledays: [],
      organizer: false,
    },
  })
}
