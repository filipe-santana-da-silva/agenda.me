import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.warn('Supabase admin endpoint not configured')
}

// GET: list auth users
export async function GET() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  try {
    // list auth users (admin endpoint)
    const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    })
    if (!usersRes.ok) return NextResponse.json({ error: await usersRes.text() }, { status: 500 })
    const usersRaw = await usersRes.json()
    // normalize users response: supabase admin may return an array or an object wrapper
    let users: Array<Record<string, unknown>> = []
    if (Array.isArray(usersRaw)) {
      users = usersRaw
    } else if ((usersRaw as Record<string, unknown>)?.users && Array.isArray((usersRaw as Record<string, unknown>).users)) {
      users = (usersRaw as Record<string, unknown>).users as Array<Record<string, unknown>>
    } else if ((usersRaw as Record<string, unknown>)?.data && Array.isArray((usersRaw as Record<string, unknown>).data)) {
      users = (usersRaw as Record<string, unknown>).data as Array<Record<string, unknown>>
    } else if (usersRaw) {
      // single user object -> wrap
      users = [usersRaw]
    }

    const formatted = (users || []).map((u) => ({
      email: (u as Record<string, unknown>).email,
      userId: (u as Record<string, unknown>).id,
      roles: [],
      pages: [],
    }))

    return NextResponse.json({ data: formatted })
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error('admin/users GET error', error)
    return NextResponse.json({ error: (e as Record<string, unknown>)?.message || String(e) }, { status: 500 })
  }
}

type CreateBody = {
  email?: string
  password?: string
  createAuthAccount?: boolean
}

// POST: create auth user
export async function POST(request: Request) {
  try {
    const body: CreateBody = await request.json()
    const email = (body.email || '').toLowerCase().trim()

    if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 })
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })

    let userId: string | undefined

    // Optionally create auth user via admin endpoint
    if (body.createAuthAccount) {
      if (!body.password) return NextResponse.json({ error: 'password is required when createAuthAccount is true' }, { status: 400 })

      const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: body.password, email_confirm: true }),
      })

      if (!createRes.ok) {
        const txt = await createRes.text()
        console.error('failed to create auth user', txt)
        return NextResponse.json({ error: `failed to create auth user: ${txt}` }, { status: 500 })
      }
      const created = await createRes.json()
      userId = created?.id
    } else {
      // attempt to find existing auth user by email
      const list = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=eq.${encodeURIComponent(email)}`, {
        headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
      })
      if (list.ok) {
        const found = await list.json()
        if (Array.isArray(found) && found.length > 0) userId = found[0].id
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Could not resolve auth user id for email. Create auth account or ensure user exists.' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    console.error('admin/users POST error', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
