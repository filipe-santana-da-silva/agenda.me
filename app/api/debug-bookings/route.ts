import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const supabase = await createClient();

    // Buscar cliente
    const { data: customerData } = await supabase
      .from("customers")
      .select("id, phone, name")
      .eq("phone", phone)
      .single();

    if (!customerData) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Buscar agendamentos
    const { data: appointmentsData } = await supabase
      .from("appointments")
      .select("*")
      .eq("customer_id", customerData.id);

    // Buscar todos os serviços
    const { data: allServices } = await supabase
      .from("services")
      .select("id, name, price_in_cents, barbershop_id");

    return NextResponse.json({
      customer: customerData,
      appointments: appointmentsData,
      allServices: allServices,
      serviceIdsInAppointments: appointmentsData?.map((a: Record<string, unknown>) => a.service_id) || [],
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
