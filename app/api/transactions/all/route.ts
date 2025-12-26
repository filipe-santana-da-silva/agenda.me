import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(transactions)
  } catch (error: Record<string, unknown>) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
