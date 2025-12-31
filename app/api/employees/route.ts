import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { withCache } from '@/lib/cache'

const EMPLOYEES_CACHE_KEY = 'employees:active'
const EMPLOYEES_CACHE_TTL = 1800 // 30 minutos

export async function GET() {
  try {
    const employees = await withCache(
      EMPLOYEES_CACHE_KEY,
      async () => {
        const supabase = await createClient()

        const { data, error } = await supabase
          .from('employees')
          .select('id, name, email, position, image_url')
          .eq('status', 'active')
          .order('name')

        if (error) {
          throw new Error(`Failed to fetch employees: ${error.message}`)
        }

        return data || []
      },
      EMPLOYEES_CACHE_TTL
    )

    const response = NextResponse.json(employees)
    response.headers.set('Cache-Control', `public, max-age=${EMPLOYEES_CACHE_TTL}`)
    return response
  } catch (err) {
    console.error('Error in /api/employees', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}