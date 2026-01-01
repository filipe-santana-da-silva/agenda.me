'use server'

import { createClient } from '@/utils/supabase/server'

export async function getReminders({ userId }: { userId: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('reminders')
      .select(`
        id,
        description,
        appointment_id,
        created_at,
        updated_at,
        appointment:appointment_id (
          id,
          appointment_date,
          appointment_time,
          status,
          customer:customer_id (
            id,
            name,
            phone
          ),
          service:service_id (
            id,
            name,
            price
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar lembretes:', error.message)
      return []
    }

    // Normalizar dados para garantir que appointment é um objeto único, não array
    const normalizedData = (data || []).map((reminder: any) => ({
      ...reminder,
      appointment: Array.isArray(reminder.appointment) && reminder.appointment.length > 0 
        ? reminder.appointment[0]
        : reminder.appointment
    }))

    return normalizedData
  } catch (err) {
    console.error('Erro inesperado ao buscar lembretes:', err)
    return []
  }
}
