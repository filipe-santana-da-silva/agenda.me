import { createClient } from "@/utils/supabase/server"

export type BookingWithRelations = {
  id: string
  customer_id: string
  service_id: string
  professional_id: string | null
  appointment_date: Date | string
  appointment_time: string
  status: string
  created_at: Date | string
  updated_at: Date | string
  service?: {
    id: string
    name: string
    description: string
    image_url: string
    price_in_cents: number
    barbershop_id: string
    deleted_at: Date | string | null
  }
  customer?: {
    id: string
    name: string
    email: string
  }
}

export const getUserBookings = async (): Promise<{
  confirmedBookings: BookingWithRelations[]
  finishedBookings: BookingWithRelations[]
}> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { confirmedBookings: [], finishedBookings: [] };
  }

  // Obter customer vinculado ao auth_id
  let customerData: { id: string } | null = null;

  const { data: customerByAuth } = await supabase
    .from("customers")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  customerData = customerByAuth;

  // Se não encontrou, tenta procurar por email
  if (!customerData && user.email) {
    const { data: customerByEmail } = await supabase
      .from("customers")
      .select("id")
      .eq("email", user.email)
      .single();

    if (customerByEmail) {
      // Vincula ao auth_id
      await supabase
        .from("customers")
        .update({ auth_id: user.id })
        .eq("id", customerByEmail.id);

      customerData = customerByEmail;
    }
  }

  // Se ainda não encontrou, tenta procurar por telefone
  if (!customerData && user.phone) {
    const { data: customerByPhone } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", user.phone)
      .single();

    if (customerByPhone) {
      // Vincula ao auth_id
      await supabase
        .from("customers")
        .update({ auth_id: user.id })
        .eq("id", customerByPhone.id);

      customerData = customerByPhone;
    }
  }

  // Se ainda não encontrou, criar novo customer
  if (!customerData) {
    const { data: newCustomer } = await supabase
      .from("customers")
      .insert({
        auth_id: user.id,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "Customer",
        email: user.email || "",
        phone: user.phone || "",
      })
      .select("id")
      .single();

    customerData = newCustomer;
  }

  if (!customerData) {
    console.log("[getUserBookings] Nenhum customer encontrado para usuário:", user.id);
    return { confirmedBookings: [], finishedBookings: [] };
  }

  const customerId = customerData.id;
  console.log("[getUserBookings] Buscando agendamentos para customer:", customerId);

  // Buscar todos os agendamentos confirmados/pendentes
  const { data: confirmedData } = await supabase
    .from("appointments")
    .select(
      `
      id,
      customer_id,
      service_id,
      professional_id,
      appointment_date,
      appointment_time,
      status,
      created_at,
      updated_at,
      services (
        id,
        name,
        description,
        image_url,
        price_in_cents,
        barbershop_id,
        deleted_at
      ),
      customers (
        id,
        name,
        email
      )
    `
    )
    .eq("customer_id", customerId)
    .in("status", ["pending", "confirmed"])
    .order("appointment_date", { ascending: true });

  // Buscar todos os agendamentos cancelados/concluídos
  const { data: pastBookings } = await supabase
    .from("appointments")
    .select(
      `
      id,
      customer_id,
      service_id,
      professional_id,
      appointment_date,
      appointment_time,
      status,
      created_at,
      updated_at,
      services (
        id,
        name,
        description,
        image_url,
        price_in_cents,
        barbershop_id,
        deleted_at
      ),
      customers (
        id,
        name,
        email
      )
    `
    )
    .eq("customer_id", customerId)
    .in("status", ["cancelled", "completed"])
    .order("appointment_date", { ascending: false });

  const finishedBookings = pastBookings
    ? pastBookings.map(convertAppointment)
    : [];

  const confirmedBookings = confirmedData
    ? confirmedData.map(convertAppointment)
    : [];

  return { confirmedBookings, finishedBookings };
};

// Função auxiliar para converter appointment do Supabase para BookingWithRelations
const convertAppointment = (appointment: Record<string, unknown>): BookingWithRelations => {
  return {
    id: appointment.id as string,
    customer_id: appointment.customer_id as string,
    service_id: appointment.service_id as string,
    professional_id: appointment.professional_id as string | null,
    appointment_date: appointment.appointment_date as Date | string,
    appointment_time: appointment.appointment_time as string,
    status: appointment.status as string,
    created_at: appointment.created_at as Date | string,
    updated_at: appointment.updated_at as Date | string,
    service: appointment.services ? {
      id: (appointment.services as Record<string, unknown>).id as string,
      name: (appointment.services as Record<string, unknown>).name as string,
      description: (appointment.services as Record<string, unknown>).description as string,
      image_url: (appointment.services as Record<string, unknown>).image_url as string,
      price_in_cents: (appointment.services as Record<string, unknown>).price_in_cents as number,
      barbershop_id: (appointment.services as Record<string, unknown>).barbershop_id as string,
      deleted_at: (appointment.services as Record<string, unknown>).deleted_at as Date | string | null,
    } : undefined,
    customer: appointment.customers ? {
      id: (appointment.customers as Record<string, unknown>).id as string,
      name: (appointment.customers as Record<string, unknown>).name as string,
      email: (appointment.customers as Record<string, unknown>).email as string,
    } : undefined,
  };
};

/**
 * Obter horários disponíveis para agendamento em uma barbearia
 */
export const getAvailableTimeSlots = async (
  barbershopId: string,
  date: Date
): Promise<string[]> => {
  const supabase = await createClient();
  
  try {
    // Buscar todos os agendamentos para a barbearia nessa data
    const appointmentDate = date.toISOString().split("T")[0];

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("appointment_time")
      .eq("service_id", barbershopId) // Ajustar conforme necessário
      .eq("appointment_date", appointmentDate)
      .in("status", ["pending", "confirmed"]);

    if (error) {
      console.error("Erro ao buscar agendamentos:", error);
      return [];
    }

    // Gerar slots de 30 minutos (9:00 até 18:00)
    const slots: string[] = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }

    // Remover slots já agendados
    const bookedTimes = (appointments || []).map((appt) => appt.appointment_time);

    return slots.filter((slot) => !bookedTimes.includes(slot));
  } catch (error) {
    console.error("Erro ao obter horários disponíveis:", error);
    return [];
  }
};
