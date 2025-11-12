'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Schema de validação com todos os campos obrigatórios
const formSchema = z.object({
  // personType is optional here; client will provide. childname optional for juridica
  personType: z.string().optional(),
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  childname: z.string().optional(),
  phone: z.string().min(1, { message: 'O telefone é obrigatório' }),
  address: z.string().min(1, { message: 'O endereço é obrigatório' }),
  documenttype: z.string().min(1, { message: 'O tipo de documento é obrigatório' }),
  documentvalue: z.string().min(1, { message: 'O número do documento é obrigatório' }),
  maritalstatus: z.string().optional(),
  profession: z.string().optional(),
})

type FormSchema = z.infer<typeof formSchema>

export async function createContractor(formData: FormSchema) {
  const supabase = createClient()
  const {
    data: { user },
  } = await (await supabase).auth.getUser()

  if (!user?.id) {
    return {
      error: 'Você precisa estar autenticado para cadastrar um contratante.',
    }
  }

  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return {
      error: schema.error.issues[0].message,
    }
  }

  try {
    const { data, error } = await (await supabase)
  .from('Contractor')
  .insert({
    name: formData.name,
    childname: formData.childname,
    phone: formData.phone,
    maritalstatus: formData.maritalstatus ?? null,
    profession: formData.profession ?? null,
    address: formData.address,
    documenttype: formData.documenttype,
    documentvalue: formData.documentvalue,
    createdat: new Date().toISOString(),
    updatedat: new Date().toISOString(),
    user_id: user.id,
  })
  .select()
  .single()


    if (error) {
      throw error
    }

    revalidatePath('/private/contractors')

    return {
      data
    }
  } catch (err) {
    console.error(err)
    return {
      error: 'Erro ao cadastrar contratante.',
    }
  }
}
