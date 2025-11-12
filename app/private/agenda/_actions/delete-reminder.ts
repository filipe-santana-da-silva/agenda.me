'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
  reminderId: z.string().min(1, 'O id do lembrete é obrigatório')
})

type FormSchema = z.infer<typeof formSchema>

export async function deleteReminder(formData: FormSchema) {
  const supabase = await createClient()
  const schema = formSchema.safeParse(formData)

  if (!schema.success) {
    return {
      error: schema.error.issues[0].message
    }
  }

  try {
    const { error: deleteError } = await supabase
      .from('reminder')
      .delete()
      .eq('id', formData.reminderId)

    if (deleteError) {
      throw deleteError
    }

    revalidatePath('/private/agenda')

    return {
      data: 'Lembrete deletado com sucesso!'
    }
  } catch (err) {
    console.error(err)
    return {
      error: 'Não foi possível deletar o lembrete'
    }
  }
}
