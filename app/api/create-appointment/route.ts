import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    const supabase = await createClient()
    const { 
      customer_id, 
      customerId,
      service_id, 
      serviceId,
      appointment_date, 
      appointmentDate,
      appointment_time, 
      appointmentTime,
      professional_id, 
      professionalId,
      status,
      customerName,
      customerPhone 
    } = await request.json()

    // Suportar ambos os formatos de naming (snake_case e camelCase)
    const finalCustomerId = customer_id || customerId
    const finalServiceId = service_id || serviceId
    const finalAppointmentDate = appointment_date || appointmentDate
    const finalAppointmentTime = appointment_time || appointmentTime
    const finalProfessionalId = professional_id || professionalId

    if (!finalAppointmentDate || !finalAppointmentTime || !finalServiceId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: service_id, appointment_date, appointment_time' }, 
        { status: 400, headers }
      )
    }

    let resolvedCustomerId = finalCustomerId

    // Se não tiver customer_id, tentar criar/encontrar o cliente
    if (!resolvedCustomerId && (customerName || customerPhone)) {
      if (!customerName || !customerPhone) {
        return NextResponse.json(
          { error: 'Se não houver customer_id, nome e telefone são obrigatórios' },
          { status: 400, headers }
        )
      }

      // Tentar encontrar cliente existente pelo telefone
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customerPhone)
        .single()

      if (existingCustomer) {
        resolvedCustomerId = existingCustomer.id
      } else {
        // Criar novo cliente
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert({
            name: customerName,
            phone: customerPhone,
          })
          .select()
          .single()

        if (createError || !newCustomer) {

          return NextResponse.json(
            { error: 'Erro ao criar perfil do cliente' },
            { status: 400, headers }
          )
        }

        resolvedCustomerId = newCustomer.id
      }
    }

    if (!resolvedCustomerId) {
      return NextResponse.json(
        { error: 'customer_id é obrigatório ou nome e telefone devem ser fornecidos' },
        { status: 400, headers }
      )
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        customer_id: resolvedCustomerId,
        service_id: finalServiceId || null,
        appointment_date: finalAppointmentDate,
        appointment_time: finalAppointmentTime,
        professional_id: finalProfessionalId || null,
        status: status || 'pending'
      })
      .select()
      .single()

    if (error) {

      return NextResponse.json({ error: error.message }, { status: 500, headers })
    }

    // Se tem profissional, criar comissão
    if (finalProfessionalId && data) {
      console.log("✅ Tentando criar comissão para profissional:", finalProfessionalId);
      
      // Buscar dados do serviço e cliente
      const { data: serviceData } = await supabase
        .from("services")
        .select("name, price, commission_rate")
        .eq("id", finalServiceId)
        .single();

      const { data: customerData } = await supabase
        .from("customers")
        .select("name")
        .eq("id", resolvedCustomerId)
        .single();

      console.log("📊 Dados do serviço:", serviceData);

      if (serviceData && serviceData.price && serviceData.commission_rate && customerData) {
        const commissionAmount = (serviceData.price * serviceData.commission_rate) / 100;
        
        console.log("💰 Valores da comissão:", {
          professional_id: finalProfessionalId,
          appointment_id: data.id,
          service_name: serviceData.name,
          customer_name: customerData.name,
          service_price: serviceData.price,
          commission_amount: commissionAmount,
          commission_rate: serviceData.commission_rate,
          commission_period: finalAppointmentDate,
        });
        
        // Inserir comissão com TODOS os campos obrigatórios
        const { data: commissionData, error: commissionError } = await supabase
          .from("professional_commissions")
          .insert({
            professional_id: finalProfessionalId,
            appointment_id: data.id,
            service_name: serviceData.name,
            customer_name: customerData.name,
            service_price: serviceData.price,
            commission_rate: serviceData.commission_rate,
            commission_amount: commissionAmount,
            commission_period: finalAppointmentDate,
            status: "pending",
          })
          .select();

        if (commissionError) {
          console.error("❌ Erro ao criar comissão:", commissionError);
        } else {
          console.log("✅ Comissão criada com sucesso:", commissionData);
        }
      } else {
        console.log("⚠️ Falta dados para criar comissão - price:", serviceData?.price, "commission_rate:", serviceData?.commission_rate);
      }
    }

    // Registrar transação (income) do agendamento
    if (data && finalServiceId) {
      console.log("✅ Tentando registrar transação de agendamento");
      
      const { data: serviceData } = await supabase
        .from("services")
        .select("name, price")
        .eq("id", finalServiceId)
        .single();

      if (serviceData && serviceData.price) {
        const { data: transactionData, error: transactionError } = await supabase
          .from("transactions")
          .insert({
            type: "income",
            category: serviceData.name,
            description: `Agendamento - ${serviceData.name}`,
            amount: serviceData.price,
            date: finalAppointmentDate,
            appointment_id: data.id,
            status: "completed",
            payment_method: "agendamento"
          })
          .select();

        if (transactionError) {
          console.error("❌ Erro ao criar transação:", transactionError);
        } else {
          console.log("✅ Transação criada com sucesso:", transactionData);
        }
      }
    }

    return NextResponse.json({ success: true, appointment: data }, { headers })
  } catch (error) {

    return NextResponse.json({ error: 'Erro interno' }, { status: 500, headers })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function GET() {
  return NextResponse.json({ message: 'API funcionando' })
}