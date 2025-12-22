"use client";

import Image from "next/image";
import { SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
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
} from "./ui/alert-dialog";
import { BookingWithRelations } from "@/data/bookings";
import BookingSummary from "./booking-summary";
import CopyButton from "@/app/barbershops/[id]/_components/copy-button";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Smartphone, Loader2 } from "lucide-react";
import { cancelBooking } from "@/actions/cancel-booking";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BookingInfoSheetProps {
  booking: BookingWithRelations;
  onClose: () => void;
}

const BookingInfoSheet = ({ booking, onClose }: BookingInfoSheetProps) => {
  const { executeAsync: executeCancelBooking, isPending: isCancelling } =
    useAction(cancelBooking);

  // Verificar se os dados existem
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

  // Determinar status baseado na data
  const status = appointmentDate && appointmentDate > new Date() ? "confirmed" : "finished";

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
          <Image src="/map.png" alt="Mapa" fill className="object-cover" />
          <div className="bg-background absolute right-5 bottom-5 left-5 flex items-center gap-3 rounded-lg px-5 py-3">
            <Avatar className="size-12">
              <AvatarImage src={booking.service?.image_url} alt={booking.service?.name} />
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden">
              <p className="font-bold">{booking.service?.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                Serviço de barbearia
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {status === "finished" ? (
            <Badge variant="secondary" className="w-fit">
              FINALIZADO
            </Badge>
          ) : (
            <Badge className="w-fit">CONFIRMADO</Badge>
          )}

          <BookingSummary
            serviceName={booking.service.name}
            servicePrice={booking.service.price_in_cents}
            barbershopName={booking.service.name}
            date={appointmentDate || new Date()}
          />
        </div>
      </div>

      <div className="flex gap-3 border-t px-5 py-6">
        <Button
          variant="outline"
          className="flex-1 rounded-full"
          onClick={onClose}
        >
          Voltar
        </Button>

        {status === "confirmed" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1 rounded-full">
                Cancelar Reserva
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja cancelar esta reserva? Esta ação não
                  pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Não, manter reserva</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    handleCancelBooking();
                  }}
                  disabled={isCancelling}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isCancelling ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Sim, cancelar"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </SheetContent>
  );
};

export default BookingInfoSheet;
