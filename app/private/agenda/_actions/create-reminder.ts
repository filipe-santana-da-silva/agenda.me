'use server'

import { supabase } from '@/utils/supabase/client'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
  description: z.string().min(1, 'A descrição do lembrete é obrigatória')
})

type FormSchema = z.infer<typeof formSchema>

export async function createReminder(formData: FormSchema) {
  const schema = formSchema.safeParse(formData)

  if (!schema.success) {
    return {
      error: schema.error.issues[0].message
    }
  }

  const { data: userData, error: authError } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user || authError) {
    return {
      error: 'Falha ao cadastrar lembrete'
    }
  }

  try {
    const { error: insertError } = await supabase
      .from('Reminder')
      .insert([
        {
          description: formData.description,
          userId: user.id
        }
      ])

    if (insertError) {
      throw insertError
    }

    revalidatePath('/dashboard')

    return {
      data: 'Lembrete cadastrado com sucesso!'
    }
  } catch (err) {
    console.error(err)
    return {
      error: 'Falha ao cadastrar lembrete'
    }
  }
}
