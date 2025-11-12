import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()

  // 🔐 Autenticação
  const {
    data: { session },
    error: sessionError,
  } = await (await supabase).auth.getSession()

  if (sessionError || !session?.user?.id) {
    return NextResponse.json({ error: 'Acesso não autorizado!' }, { status: 401 })
  }

  const clinicId = session.user.id
  const searchParams = new URL(request.url).searchParams
  const dateString = searchParams.get('date')

  // 📅 Validação da data
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return NextResponse.json({ error: 'Data inválida ou não informada' }, { status: 400 })
  }

  try {
    const [year, month, day] = dateString.split('-').map(Number)
    const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
    const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))

    // 📦 Consulta de agendamentos com todos os campos necessários
    const { data: appointments, error: aptError } = await (await supabase)
      .from('Appointment')
      .select(`
        id,
        appointmentdate,
        durationhours,
        childname,
        contractorname,
        phone,
        email,
        name,
        service (
          duration,
          name,
          price
        )
      `)
      .eq('userid', clinicId)
      .gte('appointmentdate', startDate.toISOString())
      .lte('appointmentdate', endDate.toISOString())

    if (aptError) {
      console.error('Erro ao buscar agendamentos:', aptError.message)
      return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 })
    }

    return NextResponse.json(appointments)
  } catch (err) {
    console.error('Erro inesperado:', err)
    return NextResponse.json({ error: 'Erro interno ao processar agendamentos' }, { status: 500 })
  }
}
