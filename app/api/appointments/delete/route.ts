import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const appointmentId = body.appointmentId

    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (!user || authError) {
      console.error('Auth error in delete endpoint:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Attempting to delete appointment:', appointmentId, 'by user:', user.id)

    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ 
        error: `Failed to delete appointment: ${deleteError.message}` 
      }, { status: 500 })
    }

    console.log('Appointment deleted successfully:', appointmentId)

    return NextResponse.json({ 
      data: 'Agendamento deletado com sucesso',
      deletedId: appointmentId
    })
  } catch (err: unknown) {
    console.error('Error in /api/appointments/delete:', err)
    return NextResponse.json({ 
      error: `Erro ao deletar: ${err instanceof Error ? err.message : String(err)}` 
    }, { status: 500 })
  }
}
