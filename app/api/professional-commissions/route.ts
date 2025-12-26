import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const professionalId = searchParams.get('professionalId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    let query = supabase
      .from('professional_commissions')
      .select(`
        id,
        professional_id,
        appointment_id,
        service_name,
        customer_name,
        service_price,
        commission_rate,
        commission_amount,
        commission_period,
        status,
        paid_date,
        created_at,
        updated_at,
        employees (
          id,
          name,
          email,
          position,
          department
        ),
        appointments (
          id,
          appointment_date,
          appointment_time
        )
      `)

    // Filter by user (creator of appointments)
    // Since commissions are for appointments, we need to check if the user owns these appointments
    if (professionalId) {
      query = query.eq('professional_id', professionalId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (startDate) {
      query = query.gte('commission_period', startDate)
    }

    if (endDate) {
      query = query.lte('commission_period', endDate)
    }

    const { data: commissions, error } = await query.order('commission_period', { ascending: false })

    if (error) {
      throw error
    }

    // Calculate summary
    const summary = {
      totalCommissions: 0,
      paidCommissions: 0,
      pendingCommissions: 0,
      commissionsCount: commissions?.length || 0,
      averageCommissionRate: 0,
    }

    if (commissions && commissions.length > 0) {
      const paid = commissions.filter((c) => (c as Record<string, unknown>).status === 'paid')
      const pending = commissions.filter((c) => (c as Record<string, unknown>).status === 'pending')

      summary.totalCommissions = commissions.reduce(
        (sum: number, c) => sum + parseFloat(((c as Record<string, unknown>).commission_amount as Record<string, unknown>).toString()),
        0
      )
      summary.paidCommissions = paid.reduce(
        (sum: number, c) => sum + parseFloat(((c as Record<string, unknown>).commission_amount as Record<string, unknown>).toString()),
        0
      )
      summary.pendingCommissions = pending.reduce(
        (sum: number, c) => sum + parseFloat(((c as Record<string, unknown>).commission_amount as Record<string, unknown>).toString()),
        0
      )
      summary.averageCommissionRate =
        commissions.reduce((sum: number, c) => sum + ((c as Record<string, unknown>).commission_rate as number), 0) / commissions.length
    }

    // Get commissions by professional
    const professionalStats: Record<string, Record<string, unknown>> = {}

    if (commissions && commissions.length > 0) {
      commissions.forEach((commission) => {
        const c = commission as Record<string, unknown>;
        const profId = c.professional_id
        if (!professionalStats[profId as string]) {
          const employees = c.employees as Record<string, unknown>;
          professionalStats[profId as string] = {
            professionalId: profId,
            professionalName: (employees?.name as string) || '',
            email: (employees?.email as string) || '',
            position: (employees?.position as string) || '',
            totalCommissions: 0,
            paidCommissions: 0,
            pendingCommissions: 0,
            appointmentCount: 0,
            averageCommissionRate: 0,
          }
        }

        const amount = parseFloat((c.commission_amount as Record<string, unknown>).toString())
        const prof = professionalStats[profId as string];
        prof.totalCommissions = (prof.totalCommissions as number) + amount

        if (c.status === 'paid') {
          prof.paidCommissions = (prof.paidCommissions as number) + amount
        } else if (c.status === 'pending') {
          prof.pendingCommissions = (prof.pendingCommissions as number) + amount
        }

        prof.appointmentCount = (prof.appointmentCount as number) + 1
        prof.averageCommissionRate = (prof.averageCommissionRate as number) + (c.commission_rate as number)
      })

      // Calculate average commission rate
      Object.keys(professionalStats).forEach((key) => {
        const prof = professionalStats[key]
        prof.averageCommissionRate = (prof.averageCommissionRate as number) / (prof.appointmentCount as number)
      })
    }

    return NextResponse.json({
      commissions,
      summary,
      professionalStats: Object.values(professionalStats).sort(
        (a, b) => ((b as Record<string, unknown>).totalCommissions as number) - ((a as Record<string, unknown>).totalCommissions as number)
      ),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const {
      professional_id,
      appointment_id,
      transaction_id,
      service_name,
      customer_name,
      service_price,
      commission_rate,
      commission_amount,
      commission_period,
    } = body

    if (!professional_id || !appointment_id || !commission_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('professional_commissions')
      .insert({
        professional_id,
        appointment_id,
        transaction_id,
        service_name,
        customer_name,
        service_price,
        commission_rate,
        commission_amount,
        commission_period: commission_period || format(new Date(), 'yyyy-MM-dd'),
        status: 'pending',
      })
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: unknown) {
    const err = error as Record<string, unknown>
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, status, paid_date, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing commission ID' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (notes) updateData.notes = notes
    if (status === 'paid' && !paid_date) {
      updateData.paid_date = new Date().toISOString()
    } else if (paid_date) {
      updateData.paid_date = paid_date
    }

    const { data, error } = await supabase
      .from('professional_commissions')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
