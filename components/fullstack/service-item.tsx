"use client"

import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import BookingSummary from "./booking-summary"

interface BarbershopService {
  id: string
  name: string
  description: string
  image_url: string
  price_in_cents: number
}

interface Barbershop {
  id: string
  name: string
}

interface ServiceItemProps {
  service: BarbershopService
  barbershop: Barbershop
}

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
]

export default function ServiceItem({
  service,
  barbershop,
}: ServiceItemProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined
  )
  const [sheetIsOpen, setSheetIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [customerName, setCustomerName] = useState<string>("")
  const [customerPhone, setCustomerPhone] = useState<string>("")

  // Carregar dados do cliente do localStorage
  React.useEffect(() => {
    const savedUser = localStorage.getItem('bookingUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCustomerName(user.name || "")
      setCustomerPhone(user.phone || "")
    }
  }, [])

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime(undefined)

    if (date) {
      try {
        const res = await fetch("/api/public/available-time-slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barbershopId: barbershop.id,
            date: date.toISOString(),
          }),
        })

        if (res.ok) {
          const { data } = await res.json()
          setAvailableSlots(data)
        }
      } catch (error) {
        toast.error("Erro ao carregar horários")
      }
    }
  }

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return

    setIsSubmitting(true)
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number)
      const bookingDate = new Date(selectedDate)
      bookingDate.setHours(hours, minutes)

      const res = await fetch("/api/public/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: service.id,
          barbershop_id: barbershop.id,
          appointment_date: bookingDate.toISOString(),
          customer_phone: customerPhone,
          customer_name: customerName,
        }),
      })

      if (res.ok) {
        toast.success("Agendamento realizado!")
        setSheetIsOpen(false)
        setSelectedDate(undefined)
        setSelectedTime(undefined)
      } else {
        const error = await res.json()
        toast.error(error.message || "Erro ao agendar")
      }
    } catch (error) {
      toast.error("Erro ao agendar")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border-border bg-card flex gap-3 rounded-2xl border p-3">
      {/* Service Image */}
      <div className="relative h-27.5 w-27.5 shrink-0">
        <Image
          src={service.image_url}
          alt={service.name}
          fill
          className="rounded-xl object-cover"
        />
      </div>

      {/* Service Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-1">
          <p className="text-sm font-bold">{service.name}</p>
          <p className="text-muted-foreground text-sm">
            {service.description}
          </p>
        </div>

        {/* Price and Booking Button */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">
            {formatCurrency(service.price_in_cents)}
          </p>

          <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
            <SheetTrigger asChild>
              <Button className="rounded-full" size="sm">
                Reservar
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto px-0 pb-0">
              <SheetHeader className="border-border border-b px-5 py-6">
                <SheetTitle>Fazer Reserva</SheetTitle>
              </SheetHeader>

              <div className="border-border border-b px-5 py-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Data</label>
                  <Input
                    type="date"
                    value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const dateStr = e.target.value
                      if (dateStr) {
                        const [year, month, day] = dateStr.split('-')
                        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                        handleDateSelect(date)
                      }
                    }}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="border-border flex gap-3 overflow-x-auto border-b px-5 py-6 [&::-webkit-scrollbar]:hidden">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((time) => (
                      <Button
                        key={time}
                        variant={
                          selectedTime === time ? "default" : "outline"
                        }
                        className="rounded-full"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum horário disponível
                    </p>
                  )}
                </div>
              )}

              {/* Booking Summary */}
              {selectedDate && selectedTime && (
                <div className="px-5 py-6">
                  <BookingSummary
                    serviceName={service.name}
                    servicePrice={service.price_in_cents}
                    barbershopName={barbershop.name}
                    date={selectedDate}
                    time={selectedTime}
                  />
                </div>
              )}

              <SheetFooter className="px-5 pb-6">
                <Button
                  className="w-full"
                  disabled={
                    !selectedDate || !selectedTime || isSubmitting
                  }
                  onClick={handleConfirmBooking}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Confirmar"
                  )}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
