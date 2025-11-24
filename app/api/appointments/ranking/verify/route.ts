import { NextResponse } from 'next/server'
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

    const body = await request.json().catch(() => ({})) as any
    const appointmentId: string | undefined = body.appointmentId
    const limit: number = body.limit && Number(body.limit) > 0 ? Number(body.limit) : 50

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    let query = supabaseAdmin.from('RankingEventDetail').select('id, recreatorid, appointmentid, pointsawarded, createdat, recreator:recreatorid (id, name)')
    if (appointmentId) query = query.eq('appointmentid', appointmentId)
    query = query.order('createdat', { ascending: false }).limit(limit)

    const { data, error } = await query
    if (error) {
      console.error('verify endpoint select error', error)
      return NextResponse.json({ error: error.message ?? String(error) }, { status: 500 })
    }

    const rawCount = Array.isArray(data) ? data.length : 0
    return NextResponse.json({ rawCount, sample: data ?? [] })
  } catch (e: any) {
    console.error('appointments/ranking/verify endpoint error', e)
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
