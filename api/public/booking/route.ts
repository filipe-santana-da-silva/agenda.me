import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { barbershop_id, service_id, appointment_date } = await request.json();

    if (!barbershop_id || !service_id || !appointment_date) {
      return NextResponse.json(
        { message: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Obter sessão do usuário
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Verificar se o serviço existe
    const { data: service, error: serviceError } = await supabase
      .from("barbershop_service")
      .select("*")
      .eq("id", service_id)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { message: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já existe agendamento nesse horário
    const { data: existingBooking } = await supabase
      .from("booking")
      .select("*")
      .eq("barbershop_id", barbershop_id)
      .eq("appointment_date", appointment_date)
      .is("cancelled_at", null)
      .single();

    if (existingBooking) {
      return NextResponse.json(
        { message: "Data e hora selecionadas já estão agendadas" },
        { status: 409 }
      );
    }

    // Criar agendamento
    const { data: booking, error: bookingError } = await supabase
      .from("booking")
      .insert({
        barbershop_id,
        service_id,
        appointment_date,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Erro ao criar agendamento:", bookingError);
      return NextResponse.json(
        { message: "Erro ao criar agendamento" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { booking, message: "Agendamento criado com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
