import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { startOfMonth, endOfMonth, format } from 'date-fns'

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
      const paid = commissions.filter((c: any) => c.status === 'paid')
      const pending = commissions.filter((c: any) => c.status === 'pending')

      summary.totalCommissions = commissions.reduce(
        (sum: number, c: any) => sum + parseFloat(c.commission_amount.toString()),
        0
      )
      summary.paidCommissions = paid.reduce(
        (sum: number, c: any) => sum + parseFloat(c.commission_amount.toString()),
        0
      )
      summary.pendingCommissions = pending.reduce(
        (sum: number, c: any) => sum + parseFloat(c.commission_amount.toString()),
        0
      )
      summary.averageCommissionRate =
        commissions.reduce((sum: number, c: any) => sum + c.commission_rate, 0) / commissions.length
    }

    // Get commissions by professional
    const professionalStats: Record<string, any> = {}

    if (commissions && commissions.length > 0) {
      commissions.forEach((commission: any) => {
        const profId = commission.professional_id
        if (!professionalStats[profId]) {
          professionalStats[profId] = {
            professionalId: profId,
            professionalName: commission.employees?.name || '',
            email: commission.employees?.email || '',
            position: commission.employees?.position || '',
            totalCommissions: 0,
            paidCommissions: 0,
            pendingCommissions: 0,
            appointmentCount: 0,
            averageCommissionRate: 0,
          }
        }

        const amount = parseFloat(commission.commission_amount.toString())
        professionalStats[profId].totalCommissions += amount

        if (commission.status === 'paid') {
          professionalStats[profId].paidCommissions += amount
        } else if (commission.status === 'pending') {
          professionalStats[profId].pendingCommissions += amount
        }

        professionalStats[profId].appointmentCount += 1
        professionalStats[profId].averageCommissionRate += commission.commission_rate
      })

      // Calculate average commission rate
      Object.keys(professionalStats).forEach((key) => {
        const prof = professionalStats[key]
        prof.averageCommissionRate = prof.averageCommissionRate / prof.appointmentCount
      })
    }

    return NextResponse.json({
      commissions,
      summary,
      professionalStats: Object.values(professionalStats).sort(
        (a: any, b: any) => b.totalCommissions - a.totalCommissions
      ),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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

    const updateData: any = {}
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
