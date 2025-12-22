import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { appointment_date, appointment_time, customer_id, service_id, professional_id, status } = body

    if (!appointment_date || !appointment_time || !customer_id) {
      return NextResponse.json(
        { error: 'Data, horário e cliente são obrigatórios' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        appointment_date,
        appointment_time,
        customer_id,
        service_id: service_id || null,
        professional_id: professional_id || null,
        status: status || 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating appointment:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      )
    }

    return NextResponse.json({ success: true, appointment: data }, { headers: corsHeaders })
  } catch (err) {
    console.error('Error in POST /api/clinic/appointments', err)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const date = url.searchParams.get('date') || ''

    if (!date) {
      return NextResponse.json([], { status: 200 })
    }

    const supabase = await createClient()

    // Query appointments with customer and service details
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        created_at,
        updated_at,
        customer:customer_id (
          id,
          name,
          phone
        ),
        service:service_id (
          id,
          name,
          duration,
          price
        )
      `)
      .eq('appointment_date', date)
      .order('appointment_time', { ascending: true })

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json([], { status: 500 })
    }

    // Map appointments to the shape expected by the UI
    const mapped = (data || []).map((a: any) => {
      return {
        id: a.id,
        appointment_date: a.appointment_date,
        appointment_time: a.appointment_time,
        status: a.status,
        customer_id: a.customer_id,
        service_id: a.service_id,
        created_at: a.created_at,
        updated_at: a.updated_at,
        customer: a.customer,
        service: a.service,
      }
    })

    return NextResponse.json(mapped)
  } catch (err) {
    console.error('Error in /api/clinic/appointments', err)
    return NextResponse.json([], { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const body = await request.json()
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (body.appointment_date !== undefined) updateData.appointment_date = body.appointment_date
    if (body.appointment_time !== undefined) updateData.appointment_time = body.appointment_time
    if (body.status !== undefined) updateData.status = body.status
    if (body.customer_id !== undefined) updateData.customer_id = body.customer_id
    if (body.service_id !== undefined) updateData.service_id = body.service_id
    if (body.professional_id !== undefined) updateData.professional_id = body.professional_id

    const supabase = await createClient()
    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating appointment:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in PATCH /api/clinic/appointments', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting appointment:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in DELETE /api/clinic/appointments', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
