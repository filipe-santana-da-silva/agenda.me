"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Service, Barbershop } from "@/data/barbershops";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import BookingSummary from "@/components/booking-summary";
import { Input } from "@/components/ui/input";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ServiceItemProps {
  service: Service;
  barbershop: Barbershop;
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
];

const ServiceItem = ({ service, barbershop }: ServiceItemProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined
  );
  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(
    TIME_SLOTS
  );
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  // Carregar dados do cliente do localStorage
  React.useEffect(() => {
    const savedUser = localStorage.getItem('bookingUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCustomerName(user.name || "")
      setCustomerPhone(user.phone || "")
    }
  }, [])

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
    loadAvailableTimeSlots(date);
  };

  const loadAvailableTimeSlots = async (date: string) => {
    setLoadingTimeSlots(true);
    try {
      const response = await fetch("/api/public/available-time-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barbershop_id: barbershop.id,
          date,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableTimeSlots(data.availableTimeSlots || TIME_SLOTS);
      }
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      setAvailableTimeSlots(TIME_SLOTS);
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Selecione uma data e horário");
      return;
    }

    setIsCreatingBooking(true);

    try {
      const [hours, minutes] = selectedTime.split(":");
      const date = new Date(selectedDate);
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await fetch("/api/public/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barbershop_id: barbershop.id,
          service_id: service.id,
          appointment_date: date.toISOString(),
          customer_phone: customerPhone,
          customer_name: customerName,
        }),
      });

      if (response.ok) {
        toast.success("Agendamento realizado com sucesso!");
        setSheetIsOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao realizar agendamento");
      }
    } catch (error) {
      toast.error("Erro ao realizar agendamento");
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
      <SheetTrigger asChild>
        <div className="cursor-pointer">
          <div className="flex gap-4">
            <div className="relative size-[100px] flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={service.image_url}
                alt={service.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{service.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {service.description}
              </p>
              <p className="text-lg font-bold">
                {formatCurrency(service.price_in_cents / 100)}
              </p>
            </div>
          </div>
        </div>
      </SheetTrigger>

      <SheetContent className="w-full">
        <SheetHeader>
          <SheetTitle>{service.name}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Barbershop Info */}
          <div className="flex gap-3">
            <div className="relative size-[50px] flex-shrink-0 rounded-full overflow-hidden">
              <Image
                src={barbershop.image_url}
                alt={barbershop.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-sm">{barbershop.name}</p>
              <p className="text-xs text-muted-foreground">{barbershop.address}</p>
            </div>
          </div>

          {/* Price */}
          <div>
            <p className="text-sm font-medium mb-2">Valor</p>
            <p className="text-xl font-bold">
              {formatCurrency(service.price_in_cents / 100)}
            </p>
          </div>

          {/* Date Selection */}
          <div>
            <p className="text-sm font-medium mb-2">Data</p>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateSelect(e.target.value)}
              min={format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <p className="text-sm font-medium mb-2">Horário</p>
              {loadingTimeSlots ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="size-4 animate-spin" />
                </div>
              ) : availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {availableTimeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Nenhum horário disponível
                </p>
              )}
            </div>
          )}

          {/* Summary */}
          {selectedDate && selectedTime && (
            <BookingSummary
              serviceName={service.name}
              servicePrice={service.price_in_cents / 100}
              barbershopName={barbershop.name}
              date={new Date(`${selectedDate}T${selectedTime}`)}
            />
          )}
        </div>

        <SheetFooter>
          <Button
            onClick={handleConfirmBooking}
            disabled={!selectedDate || !selectedTime || isCreatingBooking}
            className="w-full"
          >
            {isCreatingBooking ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Agendando...
              </>
            ) : (
              "Confirmar Agendamento"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ServiceItem;
