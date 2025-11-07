import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentWithService } from "./appointment-list";
import { format } from "date-fns";
import { formatCurrancy } from "@/utils/formatCurrency";

interface DialogAppointmentProps{
    appointment: AppointmentWithService | null;
}

export function DialogAppointment({ appointment } : DialogAppointmentProps){
   
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Detalhes do agendamento</DialogTitle>
                <DialogDescription>
                    Veja todos os detalhes do agendamento
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                {appointment && (
                    <article>
                        <p><span className="font-semibold">Horário agendado:</span> {appointment.time}</p>
                        <p className="mb-2"><span className="font-semibold">Data do agendamento:</span> {new Intl.DateTimeFormat('pt-BR',{
                            timeZone: 'UTC',
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit"
                        }).format(new Date(appointment.appointmentDate))}</p>
                        <p><span className="font-semibold">Nome:</span> {appointment.name}</p>
                        <p><span className="font-semibold">Telefone:</span> {appointment.phone}</p>
                        <p><span className="font-semibold">Email:</span> {appointment.email}</p>

                        <section className="bg-gray-100 mt-4 p-2 rounded-md">
                            <p><span className="font-semibold">Serviço: </span>{appointment.service.name}</p>
                            <p><span className="font-semibold">Valor: </span>{formatCurrancy((appointment.service.price / 100))}</p>
                        </section>
                    </article>
                )}
            </div>
        </DialogContent>
    )
}