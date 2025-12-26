import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type Body = {
  email?: string
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

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'server not configured' }, { status: 500 })
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    })

    if (authError) {
      console.error('error creating auth user', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, userId: authUser.user.id })
  } catch (e: Record<string, unknown>) {
    console.error('create-user error', e)
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
