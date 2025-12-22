"use client";

import Image from "next/image";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BookingWithRelations } from "@/data/bookings";
import { getBookingStatus } from "@/lib/booking-status";
import { CopyButton } from "./copy-button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Smartphone, Loader2 } from "lucide-react";
import { cancelBooking } from "@/actions/cancel-booking";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface BookingInfoSheetProps {
  booking: BookingWithRelations;
  onClose: () => void;
}

export function BookingInfoSheet({
  booking,
  onClose,
}: BookingInfoSheetProps) {
  // Schema da agenda não tem 'date' e 'cancelled_at', usar appointment_date
  const status = "confirmed"; // Status padrão para agenda
  const {
    executeAsync: executeCancelBooking,
    isPending: isCancelling,
  } = useAction(cancelBooking);

  const dateObj =
    typeof booking.appointment_date === "string"
      ? new Date(booking.appointment_date)
      : booking.appointment_date;

  const handleCancelBooking = async () => {
    const result = await executeCancelBooking({ bookingId: booking.id });

    if (result?.validationErrors) {
      return toast.error(result.validationErrors._errors?.[0]);
    }

    if (result?.serverError) {
      return toast.error(
        "Erro ao cancelar agendamento. Por favor, tente novamente."
      );
    }

    toast.success("Agendamento cancelado com sucesso!");
    onClose();
  };

  return (
    <SheetContent className="flex flex-col overflow-y-auto p-0">
      <SheetHeader className="flex flex-row items-center justify-between border-b px-5 py-6">
        <SheetTitle>Informações da Reserva</SheetTitle>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-6 px-5 py-6">
        <div className="relative h-45 w-full overflow-hidden rounded-lg">
          <Image
            src="/map.png"
            alt="Mapa"
            fill
            className="object-cover"
          />
          <div className="bg-background absolute right-5 bottom-5 left-5 flex items-center gap-3 rounded-lg px-5 py-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://images.unsplash.com/photo-1599407652437-edd4c9acdc7b?w=200&h=200&fit=crop" />
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden">
              <p className="font-bold">Barbearia Premium</p>
              <p className="text-muted-foreground truncate text-xs">
                Rua Exemplo, 123 - Centro
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {status === "confirmed" ? (
            <Badge className="w-fit">CONFIRMADO</Badge>
          ) : (
            <Badge variant="secondary" className="w-fit">
              FINALIZADO
            </Badge>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <p className="text-muted-foreground text-xs">Serviço</p>
              <p className="font-bold">{booking.service?.name || "N/A"}</p>
            </div>

            <div className="flex flex-col">
              <p className="text-muted-foreground text-xs">Horário</p>
              <p className="font-bold">{booking.appointment_time}</p>
            </div>

            <div className="flex flex-col">
              <p className="text-muted-foreground text-xs">Data</p>
              <p className="font-bold">
                {format(dateObj, "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>

            <div className="flex flex-col">
              <p className="text-muted-foreground text-xs">Preço</p>
              <p className="font-bold">
                {booking.service?.price_in_cents
                  ? `R$ ${(booking.service.price_in_cents / 100).toFixed(2)}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-xs font-semibold">
            Telefones
          </p>
          {["(11) 9999-9999", "(11) 3333-3333"].map((phone: string, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4" />
                <p className="text-sm">{phone}</p>
              </div>
              <CopyButton text={phone} />
            </div>
          ))}
        </div>

        {status === "confirmed" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Cancelar Reserva
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja cancelar este agendamento?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Não</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    "Cancelar"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </SheetContent>
  );
}
