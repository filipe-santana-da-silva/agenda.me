'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// ✅ Schema com specialty como enum e specialtylevel como número
const formSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  specialty: z.enum(['palhaço', 'animador', 'pintura facial'] as const),
  specialtylevel: z.number().min(1, { message: 'Mínimo 1' }).max(5, { message: 'Máximo 5' }),
  rg: z.string().min(1, { message: 'O RG é obrigatório' }),
  cpf: z.string().min(1, { message: 'O CPF é obrigatório' }),
  phone: z.string().min(1, { message: 'O telefone é obrigatório' }),
  address: z.string().min(1, { message: 'O endereço é obrigatório' }),
  notes: z.string().optional(),
  availabledays: z.array(z.string()).optional()
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
      specialty: 'palhaço', // ✅ valor padrão válido
      specialtylevel: 1,
      rg: '',
      cpf: '',
      phone: '',
      address: '',
      notes: '',
      availabledays: [],
    },
  })
}
