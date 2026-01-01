'use server'

import { createClient } from '@/utils/supabase/server'

export async function getAppointmentsForReminders() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('appointments')
      .select(`
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
      `)
      .in('status', ['scheduled', 'pending', 'confirmed'])
      .order('appointment_date', { ascending: true })

    if (error) {
      console.error('Erro ao buscar agendamentos:', error.message)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Erro inesperado ao buscar agendamentos:', err)
    return []
  }
}
