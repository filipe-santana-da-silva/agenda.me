import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const { service_id, barbershop_id, appointment_date, customer_phone, customer_name } = await req.json()

    console.log("📝 Booking Request received:", { service_id, barbershop_id, appointment_date, customer_phone, customer_name })

    if (!service_id || !barbershop_id || !appointment_date) {
      return NextResponse.json(
        { message: "Campos obrigatórios faltando" },
        { status: 400 }
      )
    }

    const bookingDate = new Date(appointment_date)

    // Validate date is not in the past
    if (bookingDate < new Date()) {
      return NextResponse.json(
        { message: "Data não pode ser no passado" },
        { status: 400 }
      )
    }

    // Extrair data e hora
    const appointmentDateStr = bookingDate.toISOString().split('T')[0] // YYYY-MM-DD
    const appointmentTime = bookingDate.toTimeString().slice(0, 5) // HH:mm

    // Buscar customer_id pelo telefone
    let customerId: string | null = null
    
    console.log("🔍 Looking for customer with phone:", customer_phone)
    
    if (customer_phone) {
      const { data: customerData, error: searchError } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", customer_phone)
        .single()

      console.log("📊 Customer search result:", { customerData, searchError })

      if (customerData) {
        customerId = customerData.id
        console.log("✅ Customer found:", customerId)
        
        // Atualizar nome do cliente se fornecido
        if (customer_name && customer_name !== "Cliente") {
          const { error: updateError } = await supabase
            .from("customers")
            .update({ name: customer_name })
            .eq("id", customerId)
          
          console.log("📝 Customer name update:", { customer_name, updateError })
        }
      } else {
        // Criar novo cliente se não existir
        console.log("➕ Creating new customer:", { customer_phone, customer_name })
        
        const { data: newCustomerData, error: createError } = await supabase
          .from("customers")
          .insert({
            phone: customer_phone,
            name: customer_name || "Cliente",
          })
          .select("id")
          .single()

        console.log("📊 Customer creation result:", { newCustomerData, createError })

        if (createError || !newCustomerData) {
          console.error("❌ Error creating customer:", createError)
          return NextResponse.json(
            { message: "Erro ao criar cliente", error: createError?.message },
            { status: 500 }
          )
        }
        customerId = newCustomerData.id
        console.log("✅ Customer created with ID:", customerId)
      }
    }

    if (!customerId) {
      console.error("❌ No customer ID found")
      return NextResponse.json(
        { message: "Cliente não encontrado" },
        { status: 400 }
      )
    }

    console.log("✅ Proceeding with customer ID:", customerId)

    // Check if time slot is available
    const { data: existingAppointments } = await supabase
      .from("appointments")
      .select("id")
      .eq("appointment_date", appointmentDateStr)
      .eq("appointment_time", appointmentTime)
      .eq("status", "confirmed")

    if ((existingAppointments as Array<Record<string, unknown>> || []).length > 0) {
      return NextResponse.json(
        { message: "Horário não disponível" },
        { status: 409 }
      )
    }

    // Create appointment
    console.log("📅 Creating appointment:", { customer_id: customerId, service_id, appointment_date: appointmentDateStr, appointment_time: appointmentTime })
    
    const { data: appointmentData, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        customer_id: customerId,
        service_id,
        appointment_date: appointmentDateStr,
        appointment_time: appointmentTime,
        status: "scheduled",
      })
      .select()
      .single()

    console.log("📊 Appointment creation result:", { appointmentData, appointmentError })

    if (appointmentError) {
      console.error("❌ Error creating appointment:", appointmentError)
      return NextResponse.json(
        { message: "Erro ao criar agendamento", error: appointmentError.message },
        { status: 500 }
      )
    }

    console.log("✅ Booking completed successfully")
    return NextResponse.json({ booking: appointmentData }, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { message: "Erro no servidor" },
      { status: 500 }
    )
  }
}