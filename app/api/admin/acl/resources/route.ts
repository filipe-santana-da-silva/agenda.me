import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  try {
    // pages are stored in `page` table (id, name, route)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/page?select=id,name,route&order=name`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    })
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 })
    const data = await res.json()
    return NextResponse.json({ data })
  } catch (e: unknown) {
    const error = e as Record<string, unknown>
    console.error('acl/resources GET error', e)
    return NextResponse.json({ error: error?.message || String(e) }, { status: 500 })
  }
}
