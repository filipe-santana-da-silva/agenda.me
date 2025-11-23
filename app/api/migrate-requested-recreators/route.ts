import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/client'

// POST /api/migrate-requested-recreators
// This endpoint migrates any non-empty `requested_recreator_ids` array
// from the `Appointment` table into the `AppointmentRequestedRecreator` join table.

export async function POST() {
  const supabase = createClient()
  try {
    // Fetch appointments that still have the old array field populated
    const { data: apps, error: fetchErr } = await supabase
      .from('Appointment')
      .select('id, requested_recreator_ids')
      .neq('requested_recreator_ids', null)
      .limit(1000)

    if (fetchErr) {
      console.error('Failed to fetch appointments for migration', fetchErr)
      return NextResponse.json({ ok: false, error: String(fetchErr) }, { status: 500 })
    }

    if (!apps || apps.length === 0) {
      return NextResponse.json({ ok: true, migrated: 0, message: 'No appointments with requested_recreator_ids found.' })
    }

    let migratedCount = 0
    const errors: any[] = []

    for (const a of apps) {
      const id = String((a as any).id)
      const arr = (a as any).requested_recreator_ids
      if (!Array.isArray(arr) || arr.length === 0) continue

      const rows = arr.map((rid: any) => ({ appointment_id: id, recreator_id: String(rid) }))
      const { error: insErr } = await supabase.from('AppointmentRequestedRecreator').insert(rows)
      if (insErr) {
        console.error('Failed to insert relations for appointment', id, insErr)
        errors.push({ appointment: id, error: String(insErr) })
        continue
      }

      // Optionally null out the old array column so the migration is idempotent
      const { error: updErr } = await supabase.from('Appointment').update({ requested_recreator_ids: null }).eq('id', id)
      if (updErr) {
        console.error('Failed to clear requested_recreator_ids for appointment', id, updErr)
        errors.push({ appointment: id, error: `clear_failed: ${String(updErr)}` })
        continue
      }

      migratedCount += rows.length
    }

    return NextResponse.json({ ok: true, migrated: migratedCount, errors }, { status: 200 })
  } catch (e) {
    console.error('Unexpected migration error', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
