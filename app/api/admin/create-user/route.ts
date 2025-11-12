import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type Body = {
  email?: string
  roleName?: string
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  console.warn('SUPABASE_URL not set')
}

if (!SERVICE_ROLE_KEY) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set. This endpoint requires the service role key to run properly.')
}

export async function POST(request: Request) {
  try {
    const body: Body = await request.json()
    const email = (body.email || '').toLowerCase().trim()
    const roleName = (body.roleName || '').trim()

    if (!email || !roleName) {
      return NextResponse.json({ error: 'email and roleName are required' }, { status: 400 })
    }

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'server not configured' }, { status: 500 })
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    // 1) Ensure role exists (case-insensitive match)
    const { data: existingRole } = await supabaseAdmin
      .from('role')
      .select('id,name')
      .ilike('name', roleName)
      .limit(1)
      .maybeSingle()

    let roleId: string | null = (existingRole as any)?.id ?? null

    if (!roleId) {
      const { data: insertedRole, error: insertRoleError } = await supabaseAdmin
        .from('role')
        .insert({ name: roleName })
        .select()
        .single()

      if (insertRoleError) {
        console.error('error inserting role', insertRoleError)
        return NextResponse.json({ error: insertRoleError.message }, { status: 500 })
      }

      roleId = (insertedRole as any).id
    }

    // 2) Upsert into user_permission
    const { error: upsertError } = await supabaseAdmin
      .from('user_permission')
      .upsert({ email, role_id: roleId })

    if (upsertError) {
      console.error('error upserting user_permission', upsertError)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('create-user error', e)
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
