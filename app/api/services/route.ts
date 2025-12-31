import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { withCache } from '@/lib/cache'

const SERVICES_CACHE_KEY = 'services:all'
const SERVICES_CACHE_TTL = 3600 // 1 hora - dados estáticos

export async function GET() {
  try {
    const services = await withCache(
      SERVICES_CACHE_KEY,
      async () => {
        const supabase = await createClient()

        const { data, error } = await supabase
          .from('services')
          .select('id, name, duration, price')
          .order('name')

        if (error) {
          throw new Error(`Failed to fetch services: ${error.message}`)
        }

        return data || []
      },
      SERVICES_CACHE_TTL
    )

    const response = NextResponse.json(services)
    response.headers.set('Cache-Control', `public, max-age=${SERVICES_CACHE_TTL}`)
    return response
  } catch (err) {
    console.error('Error in /api/services', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}