import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const dateParam = url.searchParams.get('date')

    const supabase = await createClient()

    // Get date range (default to current month)
    const referenceDate = dateParam ? parseISO(dateParam) : new Date()
    const monthStart = format(startOfMonth(referenceDate), "yyyy-MM-dd'T'00:00:00")
    const monthEnd = format(endOfMonth(referenceDate), "yyyy-MM-dd'T'23:59:59")

    console.log('Fetching appointments from', monthStart, 'to', monthEnd)

    // Try a simple query first to see if DB is accessible
    const { data, error } = await supabase
      .from('Appointment')
      .select('*', { count: 'exact' })
      .gte('appointmentdate', monthStart)
      .lte('appointmentdate', monthEnd)
      .order('appointmentdate', { ascending: true })

    if (error) {
      console.error('Error fetching all appointments:', {
        code: error.code,
        message: error.message,
        details: error.details,
      })
      return NextResponse.json(
        { error: error.message || 'Database error' },
        { status: 500 }
      )
    }

    console.log('Found', data?.length || 0, 'appointments')

    // Map appointments to the shape expected by the UI
    const mapped = (data || []).map((a: any) => {
      const dt = new Date(a.appointmentdate)
      const dateStr = format(dt, 'yyyy-MM-dd')
      const timeStr = format(dt, 'HH:mm')

      return {
        id: a.id,
        appointmentdate: dateStr,
        time: timeStr,
        durationhours: a.durationhours,
        recreatorscount: a.recreatorscount ?? null,
        childname: a.childname,
        contractorname: a.contractorname,
        phone: a.phone,
        email: a.email,
        address: a.address,
        eventaddress: a.eventaddress,
        outofcity: a.outofcity,
        requestedbymother: a.requestedbymother,
        color_index: a.color_index ?? a.colorIndex ?? a.color ?? null,
        proof_url: a.proof_url,
        contract_url: a.contract_url,
        eventname: a.eventname,
        bagid: a.bagid,
        recreatorid: a.recreatorid,
        recreator_ids: a.recreator_ids,
        responsible_recreatorid: a.responsible_recreatorid,
        ownerpresent: a.ownerpresent,
        childagegroup: a.childagegroup,
        userid: a.userid,
        createdat: a.createdat,
        created_by: a.created_by,
        valor_pago: a.valor_pago,
        valor_a_pagar: a.valor_a_pagar,
        service: a.service,
        name: a.name,
      }
    })

    return NextResponse.json(mapped, { status: 200 })
  } catch (err) {
    console.error('Error fetching all appointments:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
