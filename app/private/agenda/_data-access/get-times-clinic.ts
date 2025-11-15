"use server"

import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'

export async function getTimesClinicInternal({ userId }: { userId: string }) {
  const supabase = await createClient()
  if (!userId) {
    return {
      times: [],
      userId: ''
    }
  }

  try {
    // Attempt to read scheduled appointments for this user from the Appointment table
    // and produce a list of time slots (HH:mm) for the UI. We also include a
    // default set of half-hour slots (08:00-18:00) so the UI has a full day grid.
    const { data: appointments, error } = await supabase
      .from('Appointment')
      .select('appointmentdate, durationhours')
      .or(`recreatorid.eq.${userId},userid.eq.${userId}`)

    // build a base set of half-hour slots between 08:00 and 19:00 (inclusive)
    const baseSlots: string[] = []
    const startHour = 8
    const endHour = 19
    const startMinutes = startHour * 60
    const endMinutes = endHour * 60
    for (let m = startMinutes; m <= endMinutes; m += 30) {
      const h = Math.floor(m / 60)
      const mm = m % 60
      baseSlots.push(`${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`)
    }

    if (error) {
      console.error('Erro ao buscar appointments:', (error as any)?.message || error)
      // fallback to baseSlots
      return {
        times: baseSlots,
        userId
      }
    }

    // Extract time-of-day from appointmentdate and include into slots
    const appointmentTimes = new Set<string>()
    if (Array.isArray(appointments)) {
      for (const ap of appointments as any[]) {
        try {
          const dt = new Date(ap.appointmentdate)
          if (!isNaN(dt.getTime())) {
            appointmentTimes.add(format(dt, 'HH:mm'))
            // If appointment has duration, also add hourly increments covered by it
            const duration = Number(ap.durationhours) || 0
            // convert duration in hours to number of half-hour slices
            const slices = Math.ceil((duration || 0) * 2)
            for (let i = 1; i < slices; i++) {
              const slot = new Date(dt.getTime() + i * 30 * 60 * 1000)
              appointmentTimes.add(format(slot, 'HH:mm'))
            }
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    }

    // Combine base slots and appointment times, sort and return
    const combined = Array.from(new Set([...baseSlots, ...Array.from(appointmentTimes)])).sort()

    return {
      times: combined,
      userId
    }
  } catch (err) {
    console.error('Erro inesperado ao buscar horários da clínica:', err)
    return {
      times: [],
      userId
    }
  }
}

// Named export for other modules that import { getTimesClinic }
export const getTimesClinic = getTimesClinicInternal
export default getTimesClinicInternal
