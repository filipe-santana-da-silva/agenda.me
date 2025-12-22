'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
  description: z.string().min(1, 'A descrição do lembrete é obrigatória'),
  reminderdate: z.string().optional(),
})

type FormSchema = z.infer<typeof formSchema>

export async function createReminder(formData: FormSchema) {
  try {
    const supabase = await createClient()
    const schema = formSchema.safeParse(formData)

    if (!schema.success) {
      console.error('Validation error:', schema.error.issues)
      return {
        error: schema.error.issues[0]?.message || 'Erro ao validar formulário'
      }
    }

    const now = new Date().toISOString()
    const { data, error: insertError } = await supabase
      .from('Reminder')
      .insert([
        {
          description: formData.description,
          reminderdate: formData.reminderdate || now,
          createdat: now,
        }
      ])
      .select()

    if (insertError) {
      console.error('Insert error:', insertError)
      return {
        error: `Erro ao criar lembrete: ${insertError.message}`
      }
    }

    revalidatePath('/private/agenda')

    return {
      data: 'Lembrete cadastrado com sucesso!',
      reminder: data
    }
  } catch (err) {
    console.error('Unexpected error creating reminder:', err)
    return {
      error: `Erro inesperado: ${err instanceof Error ? err.message : 'Falha ao cadastrar lembrete'}`
    }
  }
}
