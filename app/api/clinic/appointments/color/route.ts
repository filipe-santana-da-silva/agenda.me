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

    // Update appointment color - no RLS in place, so any authenticated user can update any appointment
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
  } catch (err: Record<string, unknown>) {
    console.error('Error in /api/clinic/appointments/color', err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
