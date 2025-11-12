import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.warn('Supabase admin endpoint not configured')
}

// PUT: update roles/resources for a given email using ACL tables
export async function PUT(request: Request, { params }: { params: Promise<{ email?: string }> }) {
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

    const body = await request.json()
    const roleName: string | undefined = body.roleName
    const resourceIds: number[] | undefined = body.resourceIds

    if (!emailParam) return NextResponse.json({ error: 'email param required' }, { status: 400 })
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })

    // resolve auth user id by email
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

    if (!userId) return NextResponse.json({ error: 'auth user not found for email' }, { status: 400 })

    const authHeaders: Record<string, string> = { apikey: SERVICE_ROLE_KEY!, Authorization: `Bearer ${SERVICE_ROLE_KEY}` }

    // role handling: find/create role in `role` table and upsert into user_permission by email
    if (roleName) {
      let roleId: string | undefined
      const findRole = await fetch(`${SUPABASE_URL}/rest/v1/role?select=id&name=ilike.${encodeURIComponent(roleName)}`, {
        headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
      })
      if (findRole.ok) {
        const arr = await findRole.json()
        if (Array.isArray(arr) && arr.length > 0) roleId = arr[0].id
      }
      if (!roleId) {
        const insert = await fetch(`${SUPABASE_URL}/rest/v1/role`, {
          method: 'POST',
          headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: roleName }),
        })
        if (!insert.ok) return NextResponse.json({ error: await insert.text() }, { status: 500 })
        const inserted = await insert.json()
        roleId = inserted[0]?.id
      }

      if (roleId) {
        await fetch(`${SUPABASE_URL}/rest/v1/user_permission`, {
          method: 'POST',
          headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify({ email: emailParam, role_id: roleId }),
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('admin/users/[email] PUT error', e)
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}

// DELETE: remove user ACL mappings and attempt to delete auth user
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

    // delete user_permission and user_page_permission rows for this email
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/user_page_permission?email=eq.${encodeURIComponent(emailParam)}`, {
        method: 'DELETE',
        headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
      })
      await fetch(`${SUPABASE_URL}/rest/v1/user_permission?email=eq.${encodeURIComponent(emailParam)}`, {
        method: 'DELETE',
        headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
      })
    } catch (e) {
      console.warn('failed to delete user permission mappings', e)
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
  } catch (e: any) {
    console.error('admin/users/[email] DELETE error', e)
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
