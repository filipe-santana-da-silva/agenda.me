'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'

const formSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  childname: z.string().min(1, { message: 'O nome da criança é obrigatório' }),
  phone: z.string().min(1, { message: 'O telefone é obrigatório' }),
  address: z.string().min(1, { message: 'O endereço é obrigatório' }),
  documenttype: z.string().min(1, { message: 'O tipo de documento é obrigatório' }),
  documentvalue: z.string().min(1, { message: 'O número do documento é obrigatório' }),

})

export interface UseDialogContractorFormProps {
  initialValues?: {
    name: string
    childname: string
    phone: string
    address: string
    documenttype: string
    documentvalue: string
  }
}

export type DialogContractorFormData = z.infer<typeof formSchema>

export function useDialogContractorForm({ initialValues }: UseDialogContractorFormProps) {
  return useForm<DialogContractorFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      name: '',
      childname: '',
      phone: '',
      address: '',
      documenttype: '',
      documentvalue: '',
    },
  })
}
