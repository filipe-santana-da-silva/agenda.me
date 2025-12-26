import { createClient } from "@/utils/supabase/server"

export async function createBooking(input: {
  serviceId: string
  date: Date
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Validate date is not in the past
  if (input.date < new Date()) {
    throw new Error("Data não pode ser no passado")
  }

  // Get barbershop from service
  const { data: service, error: serviceError } = await supabase
    .from("barbershop_service")
    .select("barbershop_id")
    .eq("id", input.serviceId)
    .single()

  if (serviceError || !service) {
    throw new Error("Serviço não encontrado")
  }

  // Check if time slot is available
  const startOfDay = new Date(input.date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(input.date)
  endOfDay.setHours(23, 59, 59, 999)

  const { data: existingBookings, error: bookingsError } = await supabase
    .from("booking")
    .select("date")
    .eq("barbershop_id", service.barbershop_id)
    .gte("date", startOfDay.toISOString())
    .lte("date", endOfDay.toISOString())
    .is("cancelled_at", null)

  if (bookingsError) {
    throw new Error("Erro ao validar disponibilidade")
  }

  const bookingTime = input.date
    .getHours()
    .toString()
    .padStart(2, "0") +
    ":" +
    input.date.getMinutes().toString().padStart(2, "0")

  const bookedTimes = (existingBookings as Array<{ date: string }>).map((booking) => {
    const bookingDate = new Date(booking.date)
    return bookingDate.getHours().toString().padStart(2, "0") +
      ":" +
      bookingDate.getMinutes().toString().padStart(2, "0")
  })

  if (bookedTimes.includes(bookingTime)) {
    throw new Error("Horário não disponível")
  }

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from("booking")
    .insert({
      barbershop_id: service.barbershop_id,
      service_id: input.serviceId,
      user_id: user.id,
      date: input.date.toISOString(),
    })
    .select()
    .single()

  if (bookingError) {
    console.error("Error creating booking:", bookingError)
    throw new Error("Erro ao criar agendamento")
  }

  // Buscar dados do serviço para criar comissão
  const { data: serviceData } = await supabase
    .from("services")
    .select("price, commission_rate")
    .eq("id", input.serviceId)
    .single()

  // Se tem dados de comissão, criar registro
  if (serviceData && serviceData.price && serviceData.commission_rate) {
    const commissionAmount = (serviceData.price * serviceData.commission_rate) / 100
    const appointmentDate = input.date.toISOString().split("T")[0]

    // Inserir comissão
    await supabase
      .from("professional_commissions")
      .insert({
        // Nota: Este arquivo não tem professional_id, poderia ser adicionado
        barbershop_id: service.barbershop_id,
        service_id: input.serviceId,
        commission_rate: serviceData.commission_rate,
        commission_amount: commissionAmount,
        commission_period: appointmentDate,
        status: "pending",
      })
      .select()
  }

  return booking
}

