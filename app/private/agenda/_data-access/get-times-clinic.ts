"use server"

import { createClient } from '@/utils/supabase/server'

export async function getTimesClinicInternal({ userId }: { userId: string }) {
  const supabase = await createClient()
  if (!userId) {
    return {
      times: [],
      userId: ''
    }
  }

  try {
    // Build a base set of half-hour slots between 08:00 and 19:00 (inclusive)
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

    return {
      times: baseSlots,
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
