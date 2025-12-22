import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('id, name, duration, price')
      .order('name')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Erro ao carregar serviços' }, { status: 500 })
    }

    return NextResponse.json({ services: services || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}