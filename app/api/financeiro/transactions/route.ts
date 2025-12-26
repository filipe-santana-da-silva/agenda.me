import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { startOfWeek, startOfMonth, startOfQuarter, startOfYear } from 'date-fns'

export async function GET(request: Request) {
  const supabase = await createClient()

  try {
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || 'all'

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

    // Filter by date range
    const now = new Date()
    let startDate: Date | null = null

    switch (dateRange) {
      case 'today':
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        query = query.gte('date', startDate.toISOString().split('T')[0])
        break
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 0 })
        query = query.gte('date', startDate.toISOString().split('T')[0])
        break
      case 'month':
        startDate = startOfMonth(now)
        query = query.gte('date', startDate.toISOString().split('T')[0])
        break
      case 'quarter':
        startDate = startOfQuarter(now)
        query = query.gte('date', startDate.toISOString().split('T')[0])
        break
      case 'semester':
        // First or second half of year
        const currentMonth = now.getMonth()
        if (currentMonth < 6) {
          startDate = new Date(now.getFullYear(), 0, 1)
        } else {
          startDate = new Date(now.getFullYear(), 6, 1)
        }
        query = query.gte('date', startDate.toISOString().split('T')[0])
        break
      case 'year':
        startDate = startOfYear(now)
        query = query.gte('date', startDate.toISOString().split('T')[0])
        break
    }

    const { data, error } = await query.order('date', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const body = await request.json()

    // Validate required fields
    if (!body.description || !body.category || !body.amount || !body.date || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: description, category, amount, date, type' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type: body.type,
        category: body.category,
        description: body.description,
        amount: parseFloat(body.amount),
        date: body.date,
        payment_method: body.payment_method || null,
        status: body.status || 'pending',
        appointment_id: body.appointment_id || null,
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ data: data?.[0] })
  } catch (error: unknown) {
    console.error('POST /api/financeiro/transactions error:', error)
    
    // Check if it's a table not found error
    if (error instanceof Error && error.message?.includes('relation "public.transactions" does not exist')) {
      return NextResponse.json(
        { error: 'Tabela de transações não foi criada. Execute o SQL schema no Supabase.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar transação' },
      { status: 500 }
    )
  }
}
