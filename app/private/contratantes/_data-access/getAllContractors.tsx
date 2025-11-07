'use server'

import { createClient } from '@/utils/supabase/server'

export async function getAllContractors({ userId }: { userId: string }) {
  if (!userId) {
    return {
      error: 'Falha ao buscar contratantes',
    }
  }

  const supabase = createClient()

  try {
    const { data, error } = await (await supabase)
      .from('Contractor')
      .select('*')
      .eq('user_id', userId)
      .order('createdat', { ascending: false })

    if (error) {
      throw error
    }

    return {
      data,
    }
  } catch (err) {
    console.error(err)
    return {
      error: 'Erro ao buscar contratantes',
    }
  }
}
