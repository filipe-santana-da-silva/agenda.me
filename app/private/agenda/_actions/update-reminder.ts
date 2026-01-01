'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
  reminderId: z.string().min(1, 'O id do lembrete é obrigatório'),
  description: z.string().min(1, 'A descrição do lembrete é obrigatória'),
})

type FormSchema = z.infer<typeof formSchema>

export async function updateReminder(formData: FormSchema) {
  try {
    const supabase = await createClient()
    const schema = formSchema.safeParse(formData)

    if (!schema.success) {
      console.error('Validation error:', schema.error.issues)
      return {
        error: schema.error.issues[0]?.message || 'Erro ao validar formulário'
      }
    }

    const { data, error: updateError } = await supabase
      .from('reminders')
      .update({
        description: schema.data.description,
      })
      .eq('id', schema.data.reminderId)
      .select()

    if (updateError) {
      console.error('Update error:', updateError)
      return {
        error: `Erro ao atualizar lembrete: ${updateError.message}`
      }
    }

    revalidatePath('/private/agenda')

    return {
      data: 'Lembrete atualizado com sucesso!',
      reminder: data
    }
  } catch (err) {
    console.error('Unexpected error updating reminder:', err)
    return {
      error: `Erro inesperado: ${err instanceof Error ? err.message : 'Falha ao atualizar lembrete'}`
    }
  }
}
