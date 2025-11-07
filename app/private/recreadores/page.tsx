import { createClient } from '@/utils/supabase/server'
import { RecreatorList } from './_components/services-list'

export default async function RecreadoresPage() {
  const supabase = createClient()

  const { data: recreadores, error } = await (await supabase)
    .from('Recreator')
    .select('*')
    .order('createdat', { ascending: false })

  if (error) {
    console.error('Erro ao buscar recreadores:', error.message)
    return <div>Erro ao carregar recreadores</div>
  }

  return <RecreatorList recreadores={recreadores || []} />
}
