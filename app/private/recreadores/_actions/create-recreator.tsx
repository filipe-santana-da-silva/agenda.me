'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

const formSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  specialty: z.string().min(1, { message: 'A especialidade é obrigatória' }),
  specialtylevel: z.number().min(1).max(5),
  rg: z.string().min(1, { message: 'O RG é obrigatório' }),
  cpf: z.string().min(1, { message: 'O CPF é obrigatório' }),
  phone: z.string().min(1, { message: 'O telefone é obrigatório' }),
  address: z.string().min(1, { message: 'O endereço é obrigatório' }),
  notes: z.string().optional(),
  availabledays: z.array(z.string()).optional(), // ✅ compatível com jsonb
})

type FormSchema = z.infer<typeof formSchema>

export async function createRecreator(formData: FormSchema) {
  const supabase = createClient()

  // ✅ Validação do schema
  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return {
      error: schema.error.issues[0].message,
    }
  }

  // ✅ Autenticação segura
  const { data: { user }, error: authError } = await (await supabase).auth.getUser()
  if (!user?.id) {
    return {
      error: 'Você precisa estar autenticado para cadastrar um recreador.',
    }
  }

  // ✅ Inserção no Supabase
  const { error, data } = await (await supabase)
    .from('Recreator')
    .insert([{
      name: formData.name,
      specialty: formData.specialty,
      specialtylevel: formData.specialtylevel,
      rg: formData.rg,
      cpf: formData.cpf,
      phone: formData.phone,
      address: formData.address,
      notes: formData.notes,
      availabledays: formData.availabledays, // ✅ enviado como array
      userId: user.id,
    }])
    .select()
    .single()

  if (error) {
    console.error(error)
    return {
      error: 'Erro ao cadastrar recreador.',
    }
  }

  revalidatePath('/private/recreadores')

  return {
    data,
  }
}
