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

    const body = await request.json().catch(() => ({}))
    const { url, expires = 60 } = body as { url?: string; expires?: number }

    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

    // expected public url format: https://<project>.supabase.co/storage/v1/object/public/{bucket}/{path}
    try {
      const parsed = new URL(url)
      const parts = parsed.pathname.split('/').filter(Boolean)
      // find 'storage' then 'v1' then 'object' then 'public'
      const publicIndex = parts.indexOf('public')
      if (publicIndex === -1 || publicIndex + 1 >= parts.length) {
        return NextResponse.json({ error: 'unexpected url format' }, { status: 400 })
      }
      const bucket = parts[publicIndex + 1]
      const path = parts.slice(publicIndex + 2).join('/')

      if (!bucket || !path) return NextResponse.json({ error: 'could not parse bucket/path' }, { status: 400 })

      const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
      const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, expires)
      if (error) {
        console.error('createSignedUrl error', error)
        return NextResponse.json({ error: error.message || String(error) }, { status: 500 })
      }

      return NextResponse.json({ signedUrl: data.signedUrl })
    } catch (e: any) {
      console.error('signed-url parse error', e)
      return NextResponse.json({ error: 'invalid url' }, { status: 400 })
    }
  } catch (e: any) {
    console.error('signed-url endpoint error', e)
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}

export const runtime = 'nodejs'
