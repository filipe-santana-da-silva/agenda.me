import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { format, startOfMonth, endOfMonth, parseISO, addDays } from 'date-fns'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const dateParam = url.searchParams.get('date')
    const startParam = url.searchParams.get('start')
    const endParam = url.searchParams.get('end')

    const supabase = await createClient()

    // Determine date range. Priority: explicit start/end -> date param month -> current month
    let rangeStart: string
    let rangeEnd: string
    if (startParam && endParam) {
      rangeStart = startParam
      rangeEnd = endParam
    } else {
      const referenceDate = dateParam ? parseISO(dateParam) : new Date()
      rangeStart = format(startOfMonth(referenceDate), 'yyyy-MM-dd')
      const monthEndDate = endOfMonth(referenceDate)
      rangeEnd = format(monthEndDate, 'yyyy-MM-dd')
    }

    console.log('Fetching appointments for range:', rangeStart, 'to', rangeEnd)

    // Query appointments with customer and service details
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        created_at,
        updated_at,
        customer:customer_id (
          id,
          name,
          phone
        ),
        service:service_id (
          id,
          name,
          duration,
          price
        ),
        professional:professional_id (
          id,
          name,
          email,
          position
        )
      `)
      .gte('appointment_date', rangeStart)
      .lte('appointment_date', rangeEnd)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (error) {
      console.error('Error fetching all appointments:', error)
      return NextResponse.json(
        { error: error.message || 'Database error' },
        { status: 500 }
      )
    }

    console.log('Total appointments fetched:', data?.length || 0)

    // Map appointments to the shape expected by the UI
    const mapped = (data || []).map((a: Record<string, unknown>) => {
      // Process service duration from HH:MM:SS to minutes
      let durationMinutes = null
      if (a.service?.duration) {
        const duration = a.service.duration
        if (typeof duration === 'string' && duration.includes(':')) {
          // Parse HH:MM:SS format
          const parts = duration.split(':')
          if (parts.length >= 2) {
            // Take first two parts as minutes and seconds (since the format might be MM:SS instead of HH:MM:SS)
            const firstPart = parseInt(parts[0], 10)
            const secondPart = parseInt(parts[1], 10)
            
            // If first part is >= 60, it's likely minutes; otherwise it's hours
            if (firstPart >= 60) {
              durationMinutes = firstPart // Already in minutes
            } else {
              durationMinutes = firstPart * 60 + secondPart // HH:MM format
            }
          }
        } else if (typeof duration === 'number') {
          durationMinutes = duration
        }
      }

      return {
        id: a.id,
        appointmentdate: `${a.appointment_date} ${a.appointment_time}`,
        appointment_date: a.appointment_date,
        appointment_time: a.appointment_time,
        time: (a.appointment_time || '').substring(0, 5), // Get HH:mm
        status: a.status,
        customer_id: a.customer_id,
        service_id: a.service_id,
        professional_id: a.professional_id,
        created_at: a.created_at,
        updated_at: a.updated_at,
        customer: a.customer,
        service: a.service ? {
          ...a.service,
          duration: durationMinutes ?? a.service.duration
        } : null,
        professional: a.professional,
        // For backward compatibility with UI that might expect these
        contractorname: a.customer?.name || '',
        phone: a.customer?.phone || '',
        name: a.customer?.name || '',
      }
    })

    return NextResponse.json(mapped, { status: 200 })
  } catch (err) {
    console.error('Error fetching all appointments:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
