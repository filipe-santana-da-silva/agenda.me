'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

const formSchema = z.object({
  recreadorId: z.string().min(1, 'O ID do recreador é obrigatório'),
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  specialty: z.string().min(1, { message: 'A especialidade é obrigatória' }),
  specialtylevel: z.number().min(1).max(5),
  rg: z.string().min(1, { message: 'O RG é obrigatório' }),
  cpf: z.string().min(1, { message: 'O CPF é obrigatório' }),
  phone: z.string().min(1, { message: 'O telefone é obrigatório' }),
  address: z.string().min(1, { message: 'O endereço é obrigatório' }),
  notes: z.string().optional(),
  availabledays: z.array(z.string()).optional(), 
})

type FormSchema = z.infer<typeof formSchema>

export async function updateRecreator(formData: FormSchema) {
  const supabase = createClient()
  const {
    data: { session },
  } = await (await supabase).auth.getSession()

  if (!session?.user?.id) {
    return {
      error: 'Você precisa estar autenticado para atualizar um recreador.',
    }
  }

  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return {
      error: schema.error.issues[0].message,
    }
  }

  const { error } = await (await supabase)
    .from('Recreator')
    .update({
      name: formData.name,
      specialty: formData.specialty,
      specialtylevel: formData.specialtylevel,
      rg: formData.rg,
      cpf: formData.cpf,
      phone: formData.phone,
      address: formData.address,
      notes: formData.notes,
      availabledays: formData.availabledays, 
    })
    .match({
      id: formData.recreadorId,
      userId: session.user.id,
    })

  if (error) {
    console.error(error)
    return {
      error: 'Erro ao atualizar recreador.',
    }
  }

  revalidatePath('/private/recreadores')

  return {
    data: 'Recreador atualizado com sucesso!',
  }
}
