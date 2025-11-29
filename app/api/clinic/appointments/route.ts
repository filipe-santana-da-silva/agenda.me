import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const date = url.searchParams.get('date') || ''

    if (!date) {
      return NextResponse.json([], { status: 200 })
    }

    const supabase = await createClient()

    // Query appointments where appointmentdate is within the given day
    // Since appointmentdate is stored as "YYYY-MM-DD HH:mm:ss" in local timezone
    // We fetch all and filter in-memory because the database filtering doesn't work
    // reliably with "timestamp without time zone" type
    const { data, error } = await supabase
      .from('Appointment')
      .select('*')
      .order('appointmentdate', { ascending: true })

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json([], { status: 500 })
    }

    // Filter appointments in-memory by date
    const filtered = (data || []).filter((a: any) => {
      const appointmentStr = String(a.appointmentdate)
      const dateOnly = appointmentStr.substring(0, 10) // "YYYY-MM-DD"
      return dateOnly === date
    })

    // Map appointments to the shape expected by the UI
    const mapped = (filtered || []).map((a: any) => {
      // appointmentdate can be stored as "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss"
      // Extract time without timezone conversion using string parsing
      const appointmentStr = String(a.appointmentdate || '')
      // Handle both "YYYY-MM-DD HH:mm:ss" and "YYYY-MM-DDTHH:mm:ss" formats
      const [dateStr, timeStr] = appointmentStr.includes('T') 
        ? appointmentStr.split('T') 
        : appointmentStr.split(' ')
      const extractedTime = (timeStr || '').substring(0, 5) // Get HH:mm
      
      return {
        id: a.id,
        appointmentdate: a.appointmentdate,
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
        // payment fields (stored as integer cents in DB)
        valor_pago: a.valor_pago ?? a.valor_pago_cents ?? null,
        valor_a_pagar: a.valor_a_pagar ?? a.valor_a_pagar_cents ?? null,
        // derived fields
        time: extractedTime,
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
