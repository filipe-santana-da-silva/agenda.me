'use server'

import { createClient } from '@/utils/supabase/server'

export async function deleteContractor({ contractorId }: { contractorId: string }) {
  const supabase = createClient()

  // First, dissociate any Appointment rows that reference this contractor
  const { error: unlinkError } = await (await supabase)
    .from('Appointment')
    .update({ contractorid: null })
    .eq('contractorid', contractorId)

  if (unlinkError) {
    return { error: `Falha ao desvincular agendamentos: ${unlinkError.message}` }
  }

  // Now it's safe to delete the contractor
  const { error } = await (await supabase)
    .from('Contractor')
    .delete()
    .eq('id', contractorId)

  if (error) {
    return { error: error.message }
  }

  return { data: 'Contratante excluído com sucesso!' }
}
