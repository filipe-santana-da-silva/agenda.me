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
    const professionalStats: Record<string, Record<string, unknown>> = {}

    revenues?.forEach((rev) => {
      const r = rev as Record<string, unknown>
      const profId = r.professional_id as string
      const amount = parseFloat((r.revenue as Record<string, unknown>).toString())

      totalRevenue += amount

      if (r.status === 'completed') {
        completedRevenue += amount
      } else if (r.status === 'pending') {
        pendingRevenue += amount
      }

      if (!professionalStats[profId]) {
        const employees = r.employees as Record<string, unknown> | undefined
        professionalStats[profId] = {
          professionalId: profId,
          professionalName: employees?.name,
          email: employees?.email,
          position: employees?.position,
          totalRevenue: 0,
          completedRevenue: 0,
          pendingRevenue: 0,
          appointmentCount: 0,
        }
      }

      const stats = professionalStats[profId] as Record<string, unknown>
      stats.totalRevenue = (stats.totalRevenue as number) + amount
      stats.appointmentCount = (stats.appointmentCount as number) + 1

      if (r.status === 'completed') {
        stats.completedRevenue = (stats.completedRevenue as number) + amount
      } else if (r.status === 'pending') {
        stats.pendingRevenue = (stats.pendingRevenue as number) + amount
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
        (a, b) => ((b as Record<string, unknown>).totalRevenue as number) - ((a as Record<string, unknown>).totalRevenue as number)
      ),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
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
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
