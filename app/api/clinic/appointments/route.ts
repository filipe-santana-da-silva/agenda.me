import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { formatISO, parseISO, addDays, format } from 'date-fns'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const date = url.searchParams.get('date') || ''

    if (!date) {
      return NextResponse.json([], { status: 200 })
    }

    const supabase = await createClient()

    // Query appointments where appointmentdate is within the given day
    const dayStart = `${date}T00:00:00`
    const dayEnd = format(addDays(parseISO(date), 1), "yyyy-MM-dd'T'00:00:00")

    const { data, error } = await supabase
      .from('Appointment')
      .select('*')
      .gte('appointmentdate', dayStart)
      .lt('appointmentdate', dayEnd)
      .order('appointmentdate', { ascending: true })

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json([], { status: 500 })
    }

    // Map appointments to the shape expected by the UI
    const mapped = (data || []).map((a: any) => {
      const dt = new Date(a.appointmentdate)
      return {
        id: a.id,
        appointmentdate: a.appointmentdate,
        durationhours: a.durationhours,
        childname: a.childname,
        contractorname: a.contractorname,
        phone: a.phone,
        email: a.email,
        address: a.address,
        eventaddress: a.eventaddress,
        outofcity: a.outofcity,
        requestedbymother: a.requestedbymother,
        // color index: support several naming variants and normalize to a number or null
        color_index: a.color_index ?? a.colorIndex ?? a.color ?? null,
        // normalize possible proof/contract field names to stable keys the UI expects
        proof_url: a.proof_url ?? a.paymentproofurl ?? a.proofurl ?? a.payment_proof_url ?? null,
        contract_url: a.contract_url ?? a.contracturl ?? a.contract_url ?? null,
        // support single recreator id or array of recreator ids
        recreatorid: a.recreatorid ?? a.recreator_id ?? null,
        recreator_ids: a.recreator_ids ?? a.recreatorids ?? a.recreator_ids_json ?? null,
        responsible_recreatorid: a.responsible_recreatorid ?? a.responsible_recreator_id ?? null,
        ownerpresent: a.ownerpresent ?? a.owner_present ?? false,
        bagid: a.bagid,
  contractorid: a.contractorid,
  // event name (some schemas use eventname or event_name)
  eventname: a.eventname ?? a.event_name ?? null,
  userid: a.userid,
  // creator name: support several naming variants (created_by, creator_name, creatorname)
  created_by: a.created_by ?? a.creator_name ?? a.creatorname ?? a.createdby ?? null,
        createdat: a.createdat,
        updatedat: a.updatedat,
        // derived fields
        time: format(dt, 'HH:mm'),
        name: a.childname || a.contractorname || '',
        service: {
          duration: (a.durationhours || 0) * 60,
          name: a.service_name || 'Serviço',
          price: a.service_price || 0,
        },
      }
    })

    return NextResponse.json(mapped)
  } catch (err) {
    console.error('Error in /api/clinic/appointments', err)
    return NextResponse.json([], { status: 500 })
  }
}
