'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
  reminderId: z.string().min(1, 'O id do lembrete é obrigatório')
})

type FormSchema = z.infer<typeof formSchema>

export async function deleteReminder(formData: FormSchema) {
  try {
    const supabase = await createClient()
    const schema = formSchema.safeParse(formData)

    if (!schema.success) {
      console.error('Validation error:', schema.error.issues)
      return {
        error: schema.error.issues[0]?.message || 'Erro ao validar'
      }
    }

    console.log('Deletando lembrete com id:', formData.reminderId)
    const { data, error: deleteError } = await supabase
      .from('reminders')
      .delete()
      .eq('id', formData.reminderId)
      .select()

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return {
        error: `Erro ao deletar: ${deleteError.message}`
      }
    }

    revalidatePath('/private/agenda')

    return {
      data: 'Lembrete deletado com sucesso!'
    }
  } catch (err) {
    console.error('Unexpected error deleting reminder:', err)
    return {
      error: `Erro inesperado: ${err instanceof Error ? err.message : 'Não foi possível deletar'}`
    }
  }
}
