import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()

  // 🔐 Autenticação
  const {
    data: { session },
    error: sessionError,
  } = await (await supabase).auth.getSession()

  if (sessionError || !session?.user?.id) {
    return NextResponse.json({ error: 'Acesso não autorizado!' }, { status: 401 })
  }

  const searchParams = new URL(request.url).searchParams
  const dateString = searchParams.get('date')
  const startString = searchParams.get('start')
  const endString = searchParams.get('end')

  let startDate: Date
  let endDate: Date

  // Support both single date and date range queries
  if (startString && endString) {
    // Validate range dates
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startString) || !/^\d{4}-\d{2}-\d{2}$/.test(endString)) {
      return NextResponse.json({ error: 'Datas inválidas' }, { status: 400 })
    }
    const [startYear, startMonth, startDay] = startString.split('-').map(Number)
    const [endYear, endMonth, endDay] = endString.split('-').map(Number)
    startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0))
    endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999))
  } else if (dateString) {
    // 📅 Validação da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return NextResponse.json({ error: 'Data inválida ou não informada' }, { status: 400 })
    }
    const [year, month, day] = dateString.split('-').map(Number)
    startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
    endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
  } else {
    return NextResponse.json({ error: 'Data ou intervalo de datas deve ser informado' }, { status: 400 })
  }

  try {
    // 📦 Consulta de agendamentos com todos os campos necessários
    const { data: appointments, error: aptError } = await (await supabase)
      .from('appointments')
      .select(`
        id,
        customer_id,
        service_id,
        appointment_date,
        appointment_time,
        status,
        created_at,
        updated_at,
        customers (
          id,
          name,
          phone,
          email
        ),
        services (
          id,
          name,
          duration,
          price
        )
      `)
      .gte('appointment_date', startDate.toISOString().split('T')[0])
      .lte('appointment_date', endDate.toISOString().split('T')[0])

    if (aptError) {
      console.error('Erro ao buscar agendamentos:', aptError.message)
      return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 })
    }

    // Transform data to include customer and service info at top level
    const transformedAppointments = appointments?.map((apt: Record<string, unknown>) => {
      const customers = apt.customers as Record<string, unknown>
      const services = apt.services as Record<string, unknown>
      // Normalize appointment_date to YYYY-MM-DD string so frontend grouping matches
      const appointmentDateStr = apt.appointment_date ? new Date(apt.appointment_date as string | number | Date).toISOString().split('T')[0] : null

      return {
        id: apt.id,
        appointment_date: appointmentDateStr,
        appointment_time: apt.appointment_time,
        status: apt.status,
        customer_id: apt.customer_id,
        service_id: apt.service_id,
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        name: customers?.name,
        phone: customers?.phone,
        email: customers?.email,
        eventname: customers?.name,
        service: services ? {
          id: services.id,
          name: services.name,
          duration: services.duration,
          price: services.price
        } : null,
        color_index: 0,
      }
    }) || []

    return NextResponse.json(transformedAppointments)
  } catch (err) {
    console.error('Erro inesperado:', err)
    return NextResponse.json({ error: 'Erro interno ao processar agendamentos' }, { status: 500 })
  }
}
