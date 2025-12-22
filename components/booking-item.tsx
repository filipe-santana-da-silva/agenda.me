"use client";

import { useState } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Sheet, SheetTrigger } from "./ui/sheet";
import { BookingWithRelations } from "@/data/bookings";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import BookingInfoSheet from "./booking-info-sheet";

interface BookingItemProps {
  booking: BookingWithRelations;
}

const BookingItem = ({ booking }: BookingItemProps) => {
  const [sheetIsOpen, setSheetIsOpen] = useState(false);

  // Verificar se os dados existem antes de acessar
  if (!booking || !booking.service) {
    return null;
  }

  // Converter appointment_date para Date se for string
  let appointmentDate: Date | null = null;
  
  if (typeof booking.appointment_date === "string") {
    appointmentDate = new Date(booking.appointment_date);
  } else if (booking.appointment_date instanceof Date) {
    appointmentDate = booking.appointment_date;
  }

  // Se a data for inválida, não renderizar o componente
  if (!appointmentDate || isNaN(appointmentDate.getTime())) {
    return null;
  }

  // Determinar status baseado na data
  const status = appointmentDate > new Date() ? "confirmed" : "finished";

  return (
    <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
      <SheetTrigger asChild>
        <Card className="flex h-full min-h-50 min-w-85 cursor-pointer flex-row items-center justify-between p-0">
          <div className="flex flex-1 flex-col gap-4 p-4">
            {status === "finished" ? (
              <Badge variant="secondary">FINALIZADO</Badge>
            ) : (
              <Badge>CONFIRMADO</Badge>
            )}
            <div className="flex flex-col gap-2">
              <p className="font-bold">{booking.service.name}</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={booking.service?.image_url} alt={booking.service?.name} />
                </Avatar>
                <p className="text-sm font-medium">{booking.service?.name}</p>
              </div>
            </div>
          </div>

          <div className="flex h-full w-26.5 flex-col items-center justify-center border-l py-3">
            <p className="text-xs capitalize">
              {format(appointmentDate, "MMM", { locale: ptBR })}
            </p>
            <p className="text-2xl">{format(appointmentDate, "dd")}</p>
            <p className="text-xs">{booking.appointment_time}</p>
          </div>
        </Card>
      </SheetTrigger>

      <BookingInfoSheet
        booking={booking}
        onClose={() => setSheetIsOpen(false)}
      />
    </Sheet>
  );
};

export default BookingItem;
