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

    const searchParams = request.nextUrl.searchParams
    const professionalId = searchParams.get('professionalId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    let query = supabase
      .from('professional_revenue')
      .select(`
        *,
        employees:professional_id (
          id,
          name,
          email,
          position
        )
      `)

    if (professionalId) {
      query = query.eq('professional_id', professionalId)
    }

    if (startDate) {
      query = query.gte('revenue_date', startDate)
    }

    if (endDate) {
      query = query.lte('revenue_date', endDate)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: revenues, error } = await query.order('revenue_date', { ascending: false })

    if (error) throw error

    // Calculate summary
    let totalRevenue = 0
    let completedRevenue = 0
    let pendingRevenue = 0
    const professionalStats: Record<string, any> = {}

    revenues?.forEach((rev: any) => {
      const profId = rev.professional_id
      const amount = parseFloat(rev.revenue.toString())

      totalRevenue += amount

      if (rev.status === 'completed') {
        completedRevenue += amount
      } else if (rev.status === 'pending') {
        pendingRevenue += amount
      }

      if (!professionalStats[profId]) {
        professionalStats[profId] = {
          professionalId: profId,
          professionalName: rev.employees?.name,
          email: rev.employees?.email,
          position: rev.employees?.position,
          totalRevenue: 0,
          completedRevenue: 0,
          pendingRevenue: 0,
          appointmentCount: 0,
        }
      }

      professionalStats[profId].totalRevenue += amount
      professionalStats[profId].appointmentCount += 1

      if (rev.status === 'completed') {
        professionalStats[profId].completedRevenue += amount
      } else if (rev.status === 'pending') {
        professionalStats[profId].pendingRevenue += amount
      }
    })

    return NextResponse.json({
      revenues,
      summary: {
        totalRevenue,
        completedRevenue,
        pendingRevenue,
        recordCount: revenues?.length || 0,
      },
      professionalStats: Object.values(professionalStats).sort(
        (a: any, b: any) => b.totalRevenue - a.totalRevenue
      ),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('professional_revenue')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({ data: data?.[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
