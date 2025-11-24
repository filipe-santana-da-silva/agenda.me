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

    const body = await request.json()
    let startDate: string | undefined = body.startDate
    let endDate: string | undefined = body.endDate

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 })
    }

    // Accept dd/mm/yyyy from UI as well as yyyy-mm-dd. Normalize to yyyy-mm-dd parts.
    const parseParts = (s: string) => {
      if (!s) return null
      // dd/mm/yyyy -> convert
      if (s.includes('/')) {
        const [d, m, y] = s.split('/').map((v: string) => v.trim())
        if (y && m && d) return { y: parseInt(y, 10), m: parseInt(m, 10), d: parseInt(d, 10) }
      }
      // yyyy-mm-dd
      if (s.includes('-')) {
        const [y, m, d] = s.split('-').map((v: string) => v.trim())
        if (y && m && d) return { y: parseInt(y, 10), m: parseInt(m, 10), d: parseInt(d, 10) }
      }
      // fallback: try Date parse
      const dt = new Date(s)
      if (!isNaN(dt.getTime())) return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() }
      return null
    }

    const sp = parseParts(startDate)
    const ep = parseParts(endDate)
    if (!sp || !ep) {
      return NextResponse.json({ error: 'Invalid date format for startDate or endDate' }, { status: 400 })
    }

    const startDateTime = new Date(Date.UTC(sp.y, (sp.m || 1) - 1, sp.d || 1, 0, 0, 0, 0)).toISOString()
    const endDateTime = new Date(Date.UTC(ep.y, (ep.m || 1) - 1, ep.d || 1, 23, 59, 59, 999)).toISOString()

    // log normalized values for debugging
    console.debug('[ranking/aggregate] incoming', { startDate, endDate, startDateTime, endDateTime })

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })


    // First fetch appointment ids that occur within the requested appointmentdate range
    const { data: appts, error: apptsErr } = await supabaseAdmin
      .from('Appointment')
      .select('id, appointmentdate')
      .gte('appointmentdate', startDateTime)
      .lte('appointmentdate', endDateTime)

    if (apptsErr) {
      console.error('[ranking/aggregate] failed to fetch appointments', apptsErr)
      return NextResponse.json({ error: apptsErr.message ?? String(apptsErr) }, { status: 500 })
    }

    const appointmentIds = Array.isArray(appts) ? appts.map((a: any) => String(a.id)) : []
    console.debug('[ranking/aggregate] appointment ids found', { count: appointmentIds.length })

    if (appointmentIds.length === 0) {
      // no appointments in period -> no points
      return NextResponse.json({ data: [], debug: { rawCount: 0, sample: [], startDateTime, endDateTime } })
    }

    // Fetch ranking rows for these appointment ids
    const { data, error } = await supabaseAdmin
      .from('RankingEventDetail')
      .select('recreatorid, pointsawarded, createdat, appointmentid, recreator:recreatorid (name)')
      .in('appointmentid', appointmentIds)
      .order('createdat', { ascending: false })

    console.debug('[ranking/aggregate] fetched rows length (by appointment ids)', { length: data?.length ?? 0 })

    if (error) {
      console.error('aggregate endpoint select error', error)
      return NextResponse.json({ error: error.message ?? String(error) }, { status: 500 })
    }

    const agg = new Map<string, { recreatorid: string; name: string; points: number }>()
    ;(data ?? []).forEach((row: any) => {
      const id = String(row.recreatorid)
      const name = Array.isArray(row.recreator) ? row.recreator[0]?.name : row.recreator?.name
      const pts = Number(row.pointsawarded) || 0
      if (!agg.has(id)) agg.set(id, { recreatorid: id, name: name ?? id, points: pts })
      else agg.get(id)!.points += pts
    })

    const result = Array.from(agg.values()).sort((a, b) => b.points - a.points)

    // include lightweight debug info to help diagnose mismatches between appointment dates and createdat
    const sample = (data ?? []).slice(0, 8).map((r: any) => ({ recreatorid: r.recreatorid, pointsawarded: r.pointsawarded, createdat: r.createdat, name: Array.isArray(r.recreator) ? r.recreator[0]?.name : r.recreator?.name }))
    const rawCount = Array.isArray(data) ? data.length : 0

    return NextResponse.json({ data: result, debug: { rawCount, sample, startDateTime, endDateTime } })
  } catch (e: any) {
    console.error('appointments/aggregate endpoint error', e)
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
