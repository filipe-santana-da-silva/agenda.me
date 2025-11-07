'use server'

import { createClient } from '@/utils/supabase/server'

export async function deleteContractor({ contractorId }: { contractorId: string }) {
  const supabase = createClient()

  const { error } = await (await supabase)
    .from('Contractor')
    .delete()
    .eq('id', contractorId)

  if (error) {
    return { error: error.message }
  }

  return { data: 'Contratante excluído com sucesso!' }
}
