import { Appointment } from './appointments/appointment'
import { Reminders } from './reminder/reminder'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Agenda() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Erro ao buscar usuário:', error.message)
  }

  const userId = user?.id ?? null

  if (!userId) {
    // Keep behavior simple: show a friendly message when unauthenticated.
    // Alternatively, you could redirect('/login') if you prefer automatic redirect.
    return <p>Usuário não autenticado.</p>
  }

  return (
    <div className="space-y-6">
      <Appointment userId={userId} />
      {/* Reminders placed directly under the appointments list */}
      <Reminders userId={userId} />
    </div>
  )
}
