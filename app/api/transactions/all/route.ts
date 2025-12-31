import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withCache, getCacheKey } from '@/lib/cache'

const TRANSACTIONS_CACHE_TTL = 600 // 10 minutos - dados dinâmicos

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    // Generate cache key based on filters
    const cacheKey = getCacheKey('transactions:user', {
      userId: user.id,
      startDate: startDate || '',
      endDate: endDate || '',
      type: type || '',
      status: status || '',
    })

    const transactions = await withCache(
      cacheKey,
      async () => {
        // Build query
        let query = supabase
          .from('transactions')
          .select(`
            *,
            appointments (
              id,
              appointment_date,
              appointment_time,
              status,
              customers (
                id,
                name,
                phone
              ),
              services (
                id,
                name,
                duration,
                price
              )
            )
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        // Apply filters
        if (startDate) {
          query = query.gte('date', startDate)
        }

        if (endDate) {
          query = query.lte('date', endDate)
        }

        if (type) {
          query = query.eq('type', type)
        }

        if (status) {
          query = query.eq('status', status)
        }

        const { data: transactions, error } = await query

        if (error) {
          throw new Error(error.message)
        }

        return transactions || []
      },
      TRANSACTIONS_CACHE_TTL
    )

    const response = NextResponse.json(transactions)
    response.headers.set('Cache-Control', `public, max-age=${TRANSACTIONS_CACHE_TTL}`)
    return response
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
