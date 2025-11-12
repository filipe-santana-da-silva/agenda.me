import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.warn('Supabase admin endpoint not configured')
}

// GET: list auth users enriched with ACL roles and per-user resource permissions
export async function GET() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  try {
    // 1) list auth users (admin endpoint)
    const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    })
    if (!usersRes.ok) return NextResponse.json({ error: await usersRes.text() }, { status: 500 })
    const usersRaw = await usersRes.json()
    // normalize users response: supabase admin may return an array or an object wrapper
    let users: any[] = []
    if (Array.isArray(usersRaw)) {
      users = usersRaw
    } else if (usersRaw?.users && Array.isArray(usersRaw.users)) {
      users = usersRaw.users
    } else if (usersRaw?.data && Array.isArray(usersRaw.data)) {
      users = usersRaw.data
    } else if (usersRaw) {
      // single user object -> wrap
      users = [usersRaw]
    }

    // 2) fetch user permissions (mapping by email -> role)
    // user_permission table stores email and role_id FK to role table
    const upRes = await fetch(`${SUPABASE_URL}/rest/v1/user_permission?select=email,role:role(name)`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    })
    const userPermRows = upRes.ok ? await upRes.json() : []

    const roleMapByEmail: Record<string, string[]> = {}
    ;(userPermRows || []).forEach((r: any) => {
      if (!r?.email) return
      roleMapByEmail[r.email] = roleMapByEmail[r.email] || []
      if (r.role?.name) roleMapByEmail[r.email].push(r.role.name)
    })

    const formatted = (users || []).map((u: any) => ({
      email: u.email,
      userId: u.id,
      roles: roleMapByEmail[u.email] || [],
      pages: [],
    }))

    return NextResponse.json({ data: formatted })
  } catch (e: any) {
    console.error('admin/users GET error', e)
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}

type CreateBody = {
  email?: string
  password?: string
  createAuthAccount?: boolean
  roleName?: string
  resourceIds?: number[] // acl_resources ids
  resources?: Array<{ id?: number; name?: string; path?: string }>
}

// POST: create auth user (optional) and assign role + per-user resource permissions in ACL tables
export async function POST(request: Request) {
  try {
    const body: CreateBody = await request.json()
    const email = (body.email || '').toLowerCase().trim()

    if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 })
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })

    let userId: string | undefined

    // 1) Optionally create auth user via admin endpoint
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

    const authHeaders: Record<string, string> = { apikey: SERVICE_ROLE_KEY!, Authorization: `Bearer ${SERVICE_ROLE_KEY}` }

    // 2) Ensure role exists in `role` table and assign via `user_permission` (by email)
    let roleId: string | undefined
    if (body.roleName) {
      const find = await fetch(`${SUPABASE_URL}/rest/v1/role?select=id&name=ilike.${encodeURIComponent(body.roleName)}`, {
        headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
      })
      if (find.ok) {
        const arr = await find.json()
        if (Array.isArray(arr) && arr.length > 0) roleId = arr[0].id
      }
      if (!roleId) {
        const insert = await fetch(`${SUPABASE_URL}/rest/v1/role`, {
          method: 'POST',
          headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: body.roleName }),
        })
        if (!insert.ok) return NextResponse.json({ error: await insert.text() }, { status: 500 })
        const inserted = await insert.json()
        roleId = inserted[0]?.id
      }

      if (roleId) {
        // upsert user_permission by email (user_permission has unique constraint on email)
        const upsert = await fetch(`${SUPABASE_URL}/rest/v1/user_permission`, {
          method: 'POST',
          headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify({ email: email, role_id: roleId }),
        })
        if (!upsert.ok) {
          const txt = await upsert.text()
          console.error('failed to assign role (user_permission)', txt)
          return NextResponse.json({ error: `failed to assign role: ${txt}` }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('admin/users POST error', e)
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
