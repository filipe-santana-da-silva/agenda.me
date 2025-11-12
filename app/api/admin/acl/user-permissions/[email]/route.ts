import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.warn('Supabase admin endpoint not configured')
}

// helper for backward-compatibility removed: we now store per-user page permissions in user_page_permission (JSONB)

export async function GET(request: Request, { params }: { params: Promise<{ email?: string }> }) {
  try {
    const resolved = await params
    const emailParam = decodeURIComponent(resolved?.email || '')
    if (!emailParam) return NextResponse.json({ error: 'email param required' }, { status: 400 })
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })

    const authHeaders: Record<string,string> = { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` }

    // read per-user page permissions from user_page_permission by email
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_page_permission?select=pages,page_id,can_view&email=eq.${encodeURIComponent(emailParam)}`, { headers: authHeaders })
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 })
    const rows = await res.json()
    if (!Array.isArray(rows) || rows.length === 0) return NextResponse.json({ data: [] })
    // prefer the JSONB pages field if present
    const row = rows[0]
    const pages = row.pages ?? []
    return NextResponse.json({ data: pages })
  } catch (e: any) {
    console.error('acl/user-permissions GET error', e)
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ email?: string }> }) {
  try {
    const resolved = await params
    const emailParam = decodeURIComponent(resolved?.email || '')
    if (!emailParam) return NextResponse.json({ error: 'email param required' }, { status: 400 })
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })

    const authHeaders: Record<string,string> = { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` }
    const body = await request.json()
    const pagesIn: any[] | undefined = body.pages

    // resolve user id
    let userId: string | undefined
    const list = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=eq.${encodeURIComponent(emailParam)}`, { headers: authHeaders })
    if (list.ok) {
      const found = await list.json()
      if (Array.isArray(found) && found.length > 0) userId = found[0].id
    }
    if (!userId) return NextResponse.json({ error: 'auth user not found for email' }, { status: 404 })

    // replace per-user page permissions by upserting into user_page_permission (email is unique)
    // expect body.pages as an array (JSON serializable)
    if (!Array.isArray(pagesIn)) return NextResponse.json({ error: 'pages array required in body' }, { status: 400 })
    const upsert = await fetch(`${SUPABASE_URL}/rest/v1/user_page_permission`, { method: 'POST', headers: { ...authHeaders, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' }, body: JSON.stringify({ email: emailParam, pages: pagesIn }) })
    if (!upsert.ok) return NextResponse.json({ error: await upsert.text() }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('acl/user-permissions PUT error', e)
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
