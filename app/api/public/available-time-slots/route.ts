import { NextResponse } from "next/server"
import { getAvailableTimeSlots } from "@/data/bookings"

export async function POST(req: Request) {
  try {
    const { barbershopId, date } = await req.json()

    if (!barbershopId || !date) {
      return NextResponse.json(
        { error: "barbershopId e date são obrigatórios" },
        { status: 400 }
      )
    }

    const bookingDate = new Date(date)
    const availableSlots = await getAvailableTimeSlots(barbershopId, bookingDate)

    return NextResponse.json({ data: availableSlots })
  } catch (error) {
    console.error("Error fetching available time slots:", error)
    return NextResponse.json(
      { error: "Erro ao buscar horários disponíveis" },
      { status: 500 }
    )
  }
}
