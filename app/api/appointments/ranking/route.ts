import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) console.warn('SUPABASE_URL not set')
if (!SERVICE_ROLE_KEY) console.warn('SUPABASE_SERVICE_ROLE_KEY not set. This endpoint requires the service role key to run properly.')

export async function POST(request: Request) {
  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'server not configured' }, { status: 500 })
    }

    const body = await request.json()
    const rows: any[] = Array.isArray(body.rows) ? body.rows : []
    const deleteAppointmentId: string | undefined = body.deleteAppointmentId

    // Get authenticated user from server
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()
    
    if (!user || userError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If deleting ranking for an appointment, verify user owns it
    if (deleteAppointmentId) {
      const { data: appointment, error: checkError } = await serverSupabase
        .from('Appointment')
        .select('id, userid')
        .eq('id', deleteAppointmentId)
        .single()

      if (checkError || !appointment || appointment.userid !== user.id) {
        console.error('User does not own appointment:', deleteAppointmentId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // Use admin client for RankingEventDetail operations (required for system operations)
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    // If requested, delete previous ranking rows for the appointment
    if (deleteAppointmentId) {
      const { error: delErr } = await supabaseAdmin.from('RankingEventDetail').delete().eq('appointmentid', deleteAppointmentId)
      if (delErr) {
        console.error('Failed to delete old ranking rows (admin):', delErr)
        return NextResponse.json({ error: delErr.message ?? String(delErr) }, { status: 500 })
      }
    }

    if (rows.length === 0) {
      return NextResponse.json({ inserted: 0 })
    }

    // basic validation: ensure each row has required keys
    const invalid = rows.find((r) => !r || !r.recreatorid || !r.appointmentid)
    if (invalid) {
      console.error('Invalid ranking row payload (missing keys):', invalid)
      return NextResponse.json({ error: 'Invalid row payload; each row must include recreatorid and appointmentid' }, { status: 400 })
    }

    // request inserted rows back (select id) to be able to count reliably
    const insertRes = await supabaseAdmin.from('RankingEventDetail').insert(rows).select('id')
    const insErr = insertRes.error
    if (insErr) {
      console.error('Failed to insert ranking rows (admin):', insErr)
      return NextResponse.json({ error: insErr.message ?? String(insErr) }, { status: 500 })
    }

    // result data should be an array of inserted rows with ids
    const insData = insertRes.data as any[] | null
    const insertedCount = Array.isArray(insData) ? insData.length : 0
    // eslint-disable-next-line no-console
    console.debug('Inserted ranking rows count (admin):', insertedCount)

    return NextResponse.json({ inserted: insertedCount })
  } catch (e: any) {
    console.error('appointments/ranking endpoint error', e)
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
