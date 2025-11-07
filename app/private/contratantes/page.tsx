import { createClient } from '@/utils/supabase/server'
import { ContractorList } from './_components/service-list'

export default async function ContratantesPage() {
  const supabase = createClient()

  const { data: contractors, error } = await (await supabase)
    .from('Contractor')
    .select('*')
    .order('createdat', { ascending: false })

  if (error) {
    console.error('Erro ao buscar contratantes:', error.message)
    return <div>Erro ao carregar contratantes</div>
  }

  return <ContractorList contractors={contractors || []} />
}
