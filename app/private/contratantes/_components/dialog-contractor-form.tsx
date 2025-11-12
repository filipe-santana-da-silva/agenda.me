'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'

const formSchema = z
  .object({
    // pessoa física ou jurídica
    personType: z.enum(['fisica', 'juridica']).default('fisica'),
    name: z.string().min(1, { message: 'O nome é obrigatório' }),
    // childname só é obrigatório para pessoa física
    childname: z.string().optional(),
    phone: z.string().min(1, { message: 'O telefone é obrigatório' }),
    address: z.string().min(1, { message: 'O endereço é obrigatório' }),
    maritalstatus: z.string().optional(),
    profession: z.string().optional(),
    documenttype: z.string().min(1, { message: 'O tipo de documento é obrigatório' }),
    documentvalue: z.string().min(1, { message: 'O número do documento é obrigatório' }),
  })
  .superRefine((data, ctx) => {
    if (data.personType === 'fisica') {
      if (!data.childname || data.childname.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'O nome da criança é obrigatório para pessoa física',
          path: ['childname'],
        })
      }
    }
  })


export type DialogContractorFormData = z.infer<typeof formSchema>

export interface UseDialogContractorFormProps {
  initialValues?: Partial<DialogContractorFormData>
}

export function useDialogContractorForm({ initialValues }: UseDialogContractorFormProps) {
  return useForm<DialogContractorFormData>({
    // zodResolver has complex generics that sometimes conflict with react-hook-form's inferred types
    // cast to any to avoid a noisy type mismatch while keeping runtime validation
    resolver: zodResolver(formSchema) as any,
    defaultValues: initialValues || {
      personType: 'fisica',
      name: '',
      childname: '',
      phone: '',
      maritalstatus: '',
      profession: '',
      address: '',
      documenttype: '',
      documentvalue: '',
    },
  })
}
