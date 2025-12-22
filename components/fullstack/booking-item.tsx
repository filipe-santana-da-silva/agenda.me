"use client";

import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { BookingWithRelations } from "@/data/bookings";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BookingItemProps {
  booking: BookingWithRelations;
}

export function BookingItem({ booking }: BookingItemProps) {
  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const status = "confirmed"; // Schema da agenda não tem cancelled_at

  const dateObj =
    typeof booking.appointment_date === "string"
      ? new Date(booking.appointment_date)
      : booking.appointment_date;

  return (
    <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
      <SheetTrigger asChild>
        <Card className="flex h-full w-full min-w-full cursor-pointer flex-row items-center justify-between p-0">
          <div className="flex flex-1 flex-col gap-4 p-4">
            {status === "confirmed" ? (
              <Badge>CONFIRMADO</Badge>
            ) : (
              <Badge variant="secondary">FINALIZADO</Badge>
            )}
            <div className="flex flex-col gap-2">
              <p className="font-bold">{booking.service?.name}</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://images.unsplash.com/photo-1599407652437-edd4c9acdc7b?w=200&h=200&fit=crop" />
                </Avatar>
                <p className="text-sm font-medium">Barbearia Premium</p>
              </div>
            </div>
          </div>

          <div className="flex h-full w-[6.625rem] flex-col items-center justify-center border-l py-3">
            <p className="text-xs capitalize">
              {format(dateObj, "MMM", { locale: ptBR })}
            </p>
            <p className="text-2xl">{format(dateObj, "dd")}</p>
            <p className="text-xs">{booking.appointment_time}</p>
          </div>
        </Card>
      </SheetTrigger>
    </Sheet>
  );
}
