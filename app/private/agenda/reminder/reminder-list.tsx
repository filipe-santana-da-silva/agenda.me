'use client'

import { Button } from "@/components/ui/button"
import { useReminderForm, ReminderFormData } from "./reminder-form"
import { Form, FormItem, FormField, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createReminder } from "../_actions/create-reminder"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ReminderContentProps {
    closeDialog: () => void;
    onRefresh?: () => void;
}

export function Reminderlist({ closeDialog, onRefresh } : ReminderContentProps){
    const form = useReminderForm()
    const router = useRouter();

    async function onSubmit( formData: ReminderFormData){
        try {
            const response = await createReminder({ description: formData.description})
            
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
                    <Button type="submit" disabled={!form.watch("description")}>
                        Cadastrar lembrete
                    </Button>
                </form>
            </Form>
        </div>
    )
}