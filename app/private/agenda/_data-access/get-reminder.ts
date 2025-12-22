'use server'

import { createClient } from '@/utils/supabase/server'

export async function getReminders({ userId }: { userId: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('Reminder')
      .select('*')
      .order('createdat', { ascending: false })

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
