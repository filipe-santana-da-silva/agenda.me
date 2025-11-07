'use server'

import { supabase } from '@/utils/supabase/client'

export async function getTimesClinic({ userId }: { userId: string }) {
  if (!userId) {
    return {
      times: [],
      userId: ''
    }
  }

  try {
    const { data, error } = await supabase
      .from('ClinicTime') // ajuste se sua tabela tiver outro nome
      .select('*')
      .eq('userId', userId)

    if (error) {
      console.error('Erro ao buscar horários da clínica:', error.message)
      return {
        times: [],
        userId: ''
      }
    }

    return {
      times: data || [],
      userId
    }
  } catch (err) {
    console.error('Erro inesperado ao buscar horários da clínica:', err)
    return {
      times: [],
      userId
    }
  }
}
