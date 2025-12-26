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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = String(formData.get('bucket') ?? 'appointments')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'no file provided' }, { status: 400 })
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const path = `appointments/${Date.now()}_${safeName}`

    const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(path, file as File, { upsert: true })
    if (uploadError) {
      console.error('upload error', uploadError)
      return NextResponse.json({ error: uploadError.message || String(uploadError) }, { status: 500 })
    }

    const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
    const publicUrl = (publicData as Record<string, unknown>)?.publicUrl ?? null

    return NextResponse.json({ publicUrl })
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error('upload endpoint error', error)
    return NextResponse.json({ error: (e as Record<string, unknown>)?.message ?? String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
