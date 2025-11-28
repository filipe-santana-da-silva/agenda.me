import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const id = String(body.id ?? '')
    const colorIndex = body.color_index

    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
    if (typeof colorIndex !== 'number') return NextResponse.json({ error: 'missing color_index' }, { status: 400 })

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (!user || userError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the appointment belongs to the user (RLS will also enforce this)
    const { data: appointment, error: fetchError } = await supabase
      .from('Appointment')
      .select('id, userid')
      .eq('id', id)
      .single()

    if (fetchError || !appointment) {
      console.error('Appointment not found:', fetchError)
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Verify ownership (RLS will enforce this, but we verify for clarity)
    if (appointment.userid !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update with authenticated client - RLS enforces row-level security
    const { data, error } = await supabase
      .from('Appointment')
      .update({ color_index: colorIndex })
      .eq('id', id)
      .select('id, color_index')
      .single()

    if (error) {
      console.error('Failed to update appointment color_index:', error)
      return NextResponse.json({ error: error.message || String(error) }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('Error in /api/clinic/appointments/color', err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
