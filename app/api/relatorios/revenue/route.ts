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

    let reportData: any = {}

    if (reportType === 'service') {
      const serviceMap: Record<string, any> = {}

      appointments?.forEach((apt: any) => {
        if (apt.services) {
          const serviceId = apt.services.id
          const serviceName = apt.services.name
          const price = apt.services.price || 0
          
          if (!serviceMap[serviceId]) {
            serviceMap[serviceId] = {
              serviceId,
              serviceName,
              total: 0,
              count: 0,
              percentage: 0,
            }
          }
          
          serviceMap[serviceId].total += parseFloat(price.toString())
          serviceMap[serviceId].count += 1
        }
      })

      const totalRevenue = Object.values(serviceMap).reduce((sum: number, s: any) => sum + s.total, 0)
      Object.keys(serviceMap).forEach((key) => {
        serviceMap[key].percentage = totalRevenue > 0 ? (serviceMap[key].total / totalRevenue) * 100 : 0
      })

      reportData = {
        type: 'service',
        data: Object.values(serviceMap).sort((a: any, b: any) => b.total - a.total),
        totalRevenue,
      }
    } else if (reportType === 'professional') {
      const professionalMap: Record<string, any> = {}

      appointments?.forEach((apt: any) => {
        if (apt.employees && apt.services) {
          const profId = apt.employees.id
          const profName = apt.employees.name
          const price = apt.services.price || 0
          
          if (!professionalMap[profId]) {
            professionalMap[profId] = {
              professionalId: profId,
              professionalName: profName,
              total: 0,
              count: 0,
              percentage: 0,
            }
          }
          
          professionalMap[profId].total += parseFloat(price.toString())
          professionalMap[profId].count += 1
        }
      })

      const totalRevenue = Object.values(professionalMap).reduce((sum: number, p: any) => sum + p.total, 0)
      Object.keys(professionalMap).forEach((key) => {
        professionalMap[key].percentage = totalRevenue > 0 ? (professionalMap[key].total / totalRevenue) * 100 : 0
      })

      reportData = {
        type: 'professional',
        data: Object.values(professionalMap).sort((a: any, b: any) => b.total - a.total),
        totalRevenue,
      }
    } else if (reportType === 'period') {
      const periodMap: Record<string, any> = {}

      appointments?.forEach((apt: any) => {
        const date = apt.appointment_date
        const price = apt.services?.price || 0
        
        if (!periodMap[date]) {
          periodMap[date] = {
            date,
            total: 0,
            count: 0,
          }
        }
        
        periodMap[date].total += parseFloat(price.toString())
        periodMap[date].count += 1
      })

      const totalRevenue = Object.values(periodMap).reduce((sum: number, p: any) => sum + p.total, 0)

      reportData = {
        type: 'period',
        data: Object.values(periodMap).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        totalRevenue,
      }
    }

    // If no data found, return empty structure
    if (!reportData.data || reportData.data.length === 0) {
      reportData = {
        type: reportType,
        data: [],
        totalRevenue: 0,
      }
    }

    return NextResponse.json(reportData)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
