'use server'

import { createClient } from '@/utils/supabase/server'

export async function getAllRecreadores({ userId }: { userId: string }) {
  if (!userId) {
    return {
      error: 'Falha ao buscar recreadores: usuário não identificado.',
    }
  }

  const supabase = createClient()

  const { data, error } = await (await supabase)
    .from('Recreator')
    .select('*')
    .eq('userId', userId)
    .order('createdat', { ascending: false })

  if (error) {
    console.error(error)
    return {
      error: 'Erro ao buscar recreadores.',
    }
  }

  return {
    data,
  }
}
