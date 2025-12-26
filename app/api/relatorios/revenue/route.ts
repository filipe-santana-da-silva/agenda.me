import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const searchParams = request.nextUrl.searchParams
    const reportType = searchParams.get('type') || 'service'
    const dateRange = searchParams.get('dateRange') || 'month'

    // Calculate date range
    const now = new Date()
    let startDate: string
    let endDate: string

    switch (dateRange) {
      case 'month':
        startDate = startOfMonth(now).toISOString().split('T')[0]
        endDate = endOfMonth(now).toISOString().split('T')[0]
        break
      case 'year':
        startDate = startOfYear(now).toISOString().split('T')[0]
        endDate = endOfYear(now).toISOString().split('T')[0]
        break
      default:
        startDate = startOfMonth(now).toISOString().split('T')[0]
        endDate = endOfMonth(now).toISOString().split('T')[0]
    }

    // Fetch appointments directly (more reliable)
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        status,
        service_id,
        professional_id,
        services (
          id,
          name,
          price
        ),
        employees (
          id,
          name
        )
      `)
      .eq('status', 'completed')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)

    if (error) throw error

    let reportData: Record<string, unknown> = {}

    if (reportType === 'service') {
      const serviceMap: Record<string, Record<string, unknown>> = {}

      appointments?.forEach((apt: Record<string, unknown>) => {
        if (apt.services) {
          const services = apt.services as Record<string, unknown>
          const serviceId = services.id as string
          const serviceName = services.name
          const price = services.price || 0
          
          if (!serviceMap[serviceId]) {
            serviceMap[serviceId] = {
              serviceId,
              serviceName,
              total: 0,
              count: 0,
              percentage: 0,
            }
          }
          
          serviceMap[serviceId].total = (serviceMap[serviceId].total as number) + parseFloat(price.toString())
          serviceMap[serviceId].count = (serviceMap[serviceId].count as number) + 1
        }
      })

      const totalRevenue = Object.values(serviceMap).reduce((sum: number, s: Record<string, unknown>) => sum + (s.total as number), 0)
      Object.keys(serviceMap).forEach((key) => {
        serviceMap[key].percentage = totalRevenue > 0 ? ((serviceMap[key].total as number) / totalRevenue) * 100 : 0
      })

      reportData = {
        type: 'service',
        data: Object.values(serviceMap).sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b.total as number) - (a.total as number)),
        totalRevenue,
      }
    } else if (reportType === 'professional') {
      const professionalMap: Record<string, Record<string, unknown>> = {}

      appointments?.forEach((apt: Record<string, unknown>) => {
        if (apt.employees && apt.services) {
          const employees = apt.employees as Record<string, unknown>
          const services = apt.services as Record<string, unknown>
          const profId = employees.id as string
          const profName = employees.name
          const price = services.price || 0
          
          if (!professionalMap[profId]) {
            professionalMap[profId] = {
              professionalId: profId,
              professionalName: profName,
              total: 0,
              count: 0,
              percentage: 0,
            }
          }
          
          professionalMap[profId].total = (professionalMap[profId].total as number) + parseFloat(price.toString())
          professionalMap[profId].count = (professionalMap[profId].count as number) + 1
        }
      })

      const totalRevenue = Object.values(professionalMap).reduce((sum: number, p: Record<string, unknown>) => sum + (p.total as number), 0)
      Object.keys(professionalMap).forEach((key) => {
        professionalMap[key].percentage = totalRevenue > 0 ? ((professionalMap[key].total as number) / totalRevenue) * 100 : 0
      })

      reportData = {
        type: 'professional',
        data: Object.values(professionalMap).sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b.total as number) - (a.total as number)),
        totalRevenue,
      }
    } else if (reportType === 'period') {
      const periodMap: Record<string, Record<string, unknown>> = {}

      appointments?.forEach((apt: Record<string, unknown>) => {
        const date = apt.appointment_date as string
        const services = apt.services as Record<string, unknown> | undefined
        const price = services?.price || 0
        
        if (!periodMap[date]) {
          periodMap[date] = {
            date,
            total: 0,
            count: 0,
          }
        }
        
        periodMap[date].total = (periodMap[date].total as number) + parseFloat(price.toString())
        periodMap[date].count = (periodMap[date].count as number) + 1
      })

      const totalRevenue = Object.values(periodMap).reduce((sum: number, p: Record<string, unknown>) => sum + (p.total as number), 0)

      reportData = {
        type: 'period',
        data: Object.values(periodMap).sort((a: Record<string, unknown>, b: Record<string, unknown>) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime()),
        totalRevenue,
      }
    }

    // If no data found, return empty structure
    const reportDataCast = reportData as Record<string, unknown>
    if (!reportDataCast.data || (reportDataCast.data as unknown[]).length === 0) {
      reportData = {
        type: reportType,
        data: [],
        totalRevenue: 0,
      }
    }

    return NextResponse.json(reportData)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
