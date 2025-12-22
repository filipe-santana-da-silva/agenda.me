'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
  appointmentId: z.string().min(1, 'Você precisa fornecer um agendamento')
})

type FormSchema = z.infer<typeof formSchema>

export async function cancelAppointment(formData: FormSchema) {
  const supabase = createClient()
  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return {
      error: schema.error.issues[0]?.message
    }
  }

  const { data: userData, error: authError } = await (await supabase).auth.getUser()
  const user = userData?.user

  if (!user || authError) {
    return {
      error: 'Usuário não encontrado!'
    }
  }

  try {
    // Verify appointment exists before deleting
    const { data: apptData, error: apptFetchError } = await (await supabase)
      .from('appointments')
      .select('id')
      .eq('id', formData.appointmentId)
      .limit(1)

    if (apptFetchError) throw apptFetchError

    if (!apptData || apptData.length === 0) {
      return { error: 'Agendamento não encontrado.' }
    }

    // Delete the appointment
    const { error: deleteError } = await (await supabase)
      .from('appointments')
      .delete()
      .eq('id', formData.appointmentId)

    if (deleteError) {
      throw deleteError
    }

    revalidatePath('/private/agenda')

    return {
      data: 'Agendamento cancelado com sucesso!'
    }
  } catch (err) {
    console.error(err)
    return {
      error: 'Ocorreu um erro ao deletar este agendamento'
    }
  }
}
