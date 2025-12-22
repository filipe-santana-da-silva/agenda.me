import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar agendamentos existentes para a data
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('appointment_date', date)
      .neq('status', 'cancelled')

    const bookedTimes = existingAppointments?.map(apt => apt.appointment_time) || []

    // Gerar horários disponíveis (8:00 às 18:30, intervalos de 30min)
    const timeSlots = []
    for (let hour = 8; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        timeSlots.push({
          time,
          available: !bookedTimes.includes(time)
        })
      }
    }

    return NextResponse.json(timeSlots)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}