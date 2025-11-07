'use server'

import { supabase } from '@/utils/supabase/client'

export async function getReminders({ userId }: { userId: string }) {
  if (!userId) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('Reminder')
      .select('*')
      .eq('userId', userId)

    if (error) {
      console.error('Erro ao buscar lembretes:', error.message)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Erro inesperado ao buscar lembretes:', err)
    return []
  }
}
