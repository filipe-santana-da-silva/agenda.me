import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, endOfDay, format } from "date-fns";

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

export async function POST(request: NextRequest) {
  try {
    const { barbershop_id, date } = await request.json();

    if (!barbershop_id || !date) {
      return NextResponse.json(
        { message: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Buscar agendamentos já realizados para a data
    const dateObj = new Date(date);
    const startDate = startOfDay(dateObj).toISOString();
    const endDate = endOfDay(dateObj).toISOString();

    const { data: bookings, error: bookingsError } = await supabase
      .from("booking")
      .select("appointment_date")
      .eq("barbershop_id", barbershop_id)
      .gte("appointment_date", startDate)
      .lte("appointment_date", endDate)
      .is("cancelled_at", null);

    if (bookingsError) {
      console.error("Erro ao buscar agendamentos:", bookingsError);
      return NextResponse.json(
        { message: "Erro ao buscar agendamentos" },
        { status: 500 }
      );
    }

    // Extrair horários ocupados
    const occupiedTimes = new Set(
      (bookings || []).map((booking: Record<string, unknown>) =>
        format(new Date(booking.appointment_date as string | number | Date), "HH:mm")
      )
    );

    // Filtrar horários disponíveis
    const availableTimeSlots = TIME_SLOTS.filter(
      (slot) => !occupiedTimes.has(slot)
    );

    return NextResponse.json({ availableTimeSlots }, { status: 200 });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
