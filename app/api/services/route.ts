import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('services')
      .select('id, name, duration, price')
      .order('name')

    if (error) {
      console.error('Error fetching services:', error)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Error in /api/services', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}