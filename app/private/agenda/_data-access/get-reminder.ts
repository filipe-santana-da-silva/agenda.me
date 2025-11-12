'use server'

import { createClient } from '@/utils/supabase/server'

export async function getReminders({ userId }: { userId: string }) {
  if (!userId) return []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('reminder')
      .select('*')
      .eq('user_id', userId)

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
