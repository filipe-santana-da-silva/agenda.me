import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    // Use the existing server-side Supabase client. This performs a
    // lightweight, read-only query against `page` (a small table used
    // elsewhere in the app). This should not modify any data.
    const supabase = await createClient()

    const { error } = await supabase.from('page').select('id').limit(1)

    if (error) {
      console.warn('[keep-alive] supabase read error', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 502 })
    }

    return NextResponse.json({ ok: true, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('[keep-alive] unexpected error', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
