'use client'

import { Button } from "@/components/ui/button"
import { useReminderForm, ReminderFormData } from "./reminder-form"
import { Form, FormItem, FormField, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { createReminder } from "../_actions/create-reminder"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { getAppointmentsForReminders } from "../_data-access/get-appointments-for-reminders"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string | null
  customer?: Array<{
    id: string
    name: string
    phone: string
  }>
  service?: Array<{
    id: string
    name: string
    price: number
  }>
}

interface ReminderContentProps {
    closeDialog: () => void;
    onRefresh?: () => void;
}

export function Reminderlist({ closeDialog, onRefresh } : ReminderContentProps){
    const form = useReminderForm()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loadingAppointments, setLoadingAppointments] = useState(false)

    useEffect(() => {
        loadAppointments()
    }, [])

    async function loadAppointments() {
        try {
            setLoadingAppointments(true)
            const data = await getAppointmentsForReminders()
            setAppointments(data as Appointment[])
        } catch (err) {
            console.error('Erro ao carregar agendamentos:', err)
        } finally {
            setLoadingAppointments(false)
        }
    }

    async function onSubmit( formData: ReminderFormData){
        try {
            const response = await createReminder({ 
                description: formData.description,
                appointmentId: formData.appointmentId
            })
            
            if(!response) {
                toast.error('Resposta vazia do servidor')
                return;
            }

            if(response.error){
                toast.error(response.error)
                return;
            }

            if(response.data) {
                toast.success(response.data)
                form.reset()
                closeDialog();
                if (onRefresh) onRefresh();
            }
        } catch (err) {
            console.error('Error creating reminder:', err)
            toast.error('Erro inesperado ao criar lembrete')
        }
    }
    return(
        <div className="grid gap-4 py-4">
            <Form {...form}>
                <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Descreva o Lembrete: </FormLabel>
                            <FormControl>
                                <Textarea className="max-h-52 resize-none" {...field} placeholder="Digite o nome do lembrete..."/>
                            </FormControl>
                        </FormItem>
                    )}/>
                    
                    <FormField control={form.control} name="appointmentId" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Agendamento (Opcional)</FormLabel>
                            <FormControl>
                                <Select value={field.value || ""} onValueChange={(value) => field.onChange(value || null)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um agendamento..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingAppointments ? (
                                            <SelectItem value="none" disabled>Carregando...</SelectItem>
                                        ) : appointments.length === 0 ? (
                                            <SelectItem value="none" disabled>Nenhum agendamento disponível</SelectItem>
                                        ) : (
                                            appointments.map((apt) => (
                                                <SelectItem key={apt.id} value={apt.id}>
                                                    {apt.customer?.[0]?.name} - {apt.service?.[0]?.name} ({new Date(apt.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR')} às {apt.appointment_time})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    
                    <Button type="submit" disabled={!form.watch("description")}>
                        Cadastrar lembrete
                    </Button>
                </form>
            </Form>
        </div>
    )
}