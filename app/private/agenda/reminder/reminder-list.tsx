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
}

export function Reminderlist({ closeDialog } : ReminderContentProps){
    const form = useReminderForm()
    const router = useRouter();

    async function onSubmit( formData: ReminderFormData){
        const response = await createReminder({ description: formData.description})
        
        if(response.error){
            toast.error(response.error)
            return;
        }
        toast.success(response.data)
        router.refresh();
        closeDialog();
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