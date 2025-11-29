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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      console.error('Auth error:', authError)
      return {
        error: 'Usuário não encontrado'
      }
    }

    const appointmentId = schema.data.appointmentId
    console.log('Attempting to delete appointment:', appointmentId)

    // First, delete related RankingEventDetail records
    const { error: rankingDeleteError } = await supabase
      .from('RankingEventDetail')
      .delete()
      .eq('appointmentid', appointmentId)

    if (rankingDeleteError) {
      console.error('Error deleting ranking details:', rankingDeleteError)
      return {
        error: `Erro ao remover dados relacionados: ${rankingDeleteError.message}`
      }
    }

    // Then delete related AppointmentRequestedRecreator records
    const { error: requestedDeleteError } = await supabase
      .from('AppointmentRequestedRecreator')
      .delete()
      .eq('appointment_id', appointmentId)

    if (requestedDeleteError) {
      console.error('Error deleting requested recreators:', requestedDeleteError)
      return {
        error: `Erro ao remover recreadores solicitados: ${requestedDeleteError.message}`
      }
    }

    // Finally, delete the appointment
    const { error: deleteError } = await supabase
      .from('Appointment')
      .delete()
      .eq('id', appointmentId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return {
        error: `Erro ao deletar agendamento: ${deleteError.message}`
      }
    }

    console.log('Appointment deleted successfully:', appointmentId)
    
    revalidatePath('/private/agenda')

    return {
      data: 'Agendamento deletado com sucesso'
    }
  } catch (error) {
    console.error('Unexpected error in deleteAppointment:', error)
    return {
      error: `Erro ao deletar agendamento: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}
