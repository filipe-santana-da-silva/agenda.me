'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
  appointmentId: z.string().min(1, 'O id do agendamento é obrigatório')
})

type FormSchema = z.infer<typeof formSchema>

export async function deleteAppointment(formData: FormSchema) {
  try {
    const supabase = await createClient()
    const schema = formSchema.safeParse(formData)

    if (!schema.success) {
      console.error('Validation error:', schema.error.issues)
      return {
        error: schema.error.issues[0]?.message || 'Erro ao validar'
      }
    }

    const { data: userData, error: authError } = await supabase.auth.getUser()
    if (!userData?.user || authError) {
      console.error('Auth error:', authError)
      return {
        error: 'Usuário não encontrado'
      }
    }

    const { error: deleteError } = await supabase
      .from('Appointment')
      .delete()
      .eq('id', schema.data.appointmentId)
      .eq('userid', userData.user.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return {
        error: 'Erro ao deletar agendamento'
      }
    }

    revalidatePath('/private/agenda')

    return {
      data: 'Agendamento deletado com sucesso'
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      error: 'Erro ao deletar agendamento'
    }
  }
}
