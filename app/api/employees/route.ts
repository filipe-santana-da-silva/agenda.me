import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('employees')
      .select('id, name, email, position')
      .eq('status', 'active')
      .order('name')

    if (error) {
      console.error('Error fetching employees:', error)
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Error in /api/employees', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}