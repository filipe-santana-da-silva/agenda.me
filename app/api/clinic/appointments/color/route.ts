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
    const id = String(body.id ?? '')
    const colorIndex = body.color_index

    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
    if (typeof colorIndex !== 'number') return NextResponse.json({ error: 'missing color_index' }, { status: 400 })

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    const { data, error } = await supabaseAdmin.from('Appointment').update({ color_index: colorIndex }).eq('id', id).select('id, color_index').single()

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

export const runtime = 'nodejs'
