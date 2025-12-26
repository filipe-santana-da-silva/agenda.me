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

    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const appointmentId: string | undefined = (body as Record<string, unknown>).appointmentId as string | undefined
    const limit: number = (body as Record<string, unknown>).limit && Number((body as Record<string, unknown>).limit) > 0 ? Number((body as Record<string, unknown>).limit) : 50

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
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error('appointments/ranking/verify endpoint error', error)
    return NextResponse.json({ error: (e as Record<string, unknown>)?.message ?? String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
