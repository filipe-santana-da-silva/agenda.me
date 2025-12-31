import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { withCache } from '@/lib/cache'

const CUSTOMERS_CACHE_KEY = 'customers:all'
const CUSTOMERS_CACHE_TTL = 1800 // 30 minutos

export async function GET() {
  try {
    const customers = await withCache(
      CUSTOMERS_CACHE_KEY,
      async () => {
        const supabase = await createClient()

        const { data, error } = await supabase
          .from('customers')
          .select('id, name, phone')
          .order('name')

        if (error) {
          throw new Error(`Failed to fetch customers: ${error.message}`)
        }

        return data || []
      },
      CUSTOMERS_CACHE_TTL
    )

    const response = NextResponse.json(customers)
    response.headers.set('Cache-Control', `public, max-age=${CUSTOMERS_CACHE_TTL}`)
    return response
  } catch (err) {
    console.error('Error in /api/customers', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}