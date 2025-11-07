'use server'

import { supabase } from '@/utils/supabase/client'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
  appointmentId: z.string().min(1, 'Você precisa fornecer um agendamento')
})

type FormSchema = z.infer<typeof formSchema>

export async function cancelAppointment(formData: FormSchema) {
  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return {
      error: schema.error.issues[0]?.message
    }
  }

  const { data: userData, error: authError } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user || authError) {
    return {
      error: 'Usuário não encontrado!'
    }
  }

  try {
    const { error: deleteError } = await supabase
      .from('Appointment')
      .delete()
      .match({
        id: formData.appointmentId,
        userId: user.id
      })

    if (deleteError) {
      throw deleteError
    }

    revalidatePath('/dashboard') // opcional, se quiser atualizar a página

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
