import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.warn('Supabase admin endpoint not configured')
}

// DELETE: remove auth user
export async function DELETE(request: Request, { params }: { params: Promise<{ email?: string }> }) {
  try {
    const resolvedParams = await params
    let emailParam = ''
    try {
      emailParam = decodeURIComponent(resolvedParams?.email || '')
    } catch (e) {
      emailParam = resolvedParams?.email || ''
    }
    if (!emailParam) {
      try {
        const reqUrl = new URL(request.url)
        const q = reqUrl.searchParams.get('email')
        if (q) emailParam = decodeURIComponent(q)
      } catch (e) {
        // ignore
      }
    }
    if (!emailParam) return NextResponse.json({ error: 'email param required' }, { status: 400 })
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })

    // resolve user id
    let userId: string | undefined
    try {
      const list = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=eq.${encodeURIComponent(emailParam)}`, {
        headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
      })
      if (list.ok) {
        const found = await list.json()
        if (Array.isArray(found) && found.length > 0) userId = found[0].id
      }
    } catch (e) {
      // ignore
    }

    // attempt to delete auth user (best-effort)
    try {
      if (userId) {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
        })
      }
    } catch (e) {
      console.warn('could not delete auth user (admin). service key or endpoint may not be available', e)
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    console.error('admin/users/[email] DELETE error', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
