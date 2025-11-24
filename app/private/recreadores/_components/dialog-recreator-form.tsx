'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

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
