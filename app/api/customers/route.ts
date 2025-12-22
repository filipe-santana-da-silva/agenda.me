import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('customers')
      .select('id, name, phone')
      .order('name')

    if (error) {
      console.error('Error fetching customers:', error)
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Error in /api/customers', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}