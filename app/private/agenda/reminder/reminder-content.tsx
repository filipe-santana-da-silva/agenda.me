'use client'

import { useState } from "react"
import { Reminder } from "@/generated/prisma"
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card"
import { Plus, Trash2, NotebookPen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { deleteReminder } from "../_actions/delete-reminder"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Reminderlist } from "./reminder-list"

interface ReminderListProps {
    reminder: Reminder[]
}


export function ReminderList({ reminder } : ReminderListProps){

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const router = useRouter();

    async function handleDeleteReminder(id: string){
        const response = await deleteReminder({ reminderId: id})

        if(response.error){
            toast.error(response.error)
        }
        toast.success(response.data);
        router.refresh();
    }
    return(
        <div className="flex flex-col gap-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex justify-center items-center">
                        <NotebookPen className="mr-5"/> 
                        <CardTitle className="text-xl md:text-2xl font-bold">Lembretes</CardTitle>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="w-9 p-0 cursor-pointer">
                                <Plus className="w-5 h-5"/>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Novo lembrete</DialogTitle>
                                <DialogDescription>Criar um novo lembrete para sua lista</DialogDescription>
                                <div>
                                    <Reminderlist closeDialog={() => setIsDialogOpen(false)}/>
                                </div>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {reminder.length === 0  && (
                        <p className="text-sm text-gray-500">Nenhum lembrete registrado</p>
                    )}
                    <ScrollArea className="h-[340px] lg:max-h-[calc(100vh - 15rem)] pr-0 w-full flex-1">
                        {reminder.map((item) => (
                            <article key={item.id} className="flex flex-wrap flex-row items-center justify-between py-2 bg-blue-50 mb-2 px-2 rounded-md">
                                <p className="text-sm lg:text-base">{item.description}</p>
                                <Button onClick={() => handleDeleteReminder(item.id)} className="bg-transparent hover:bg-transparent shadow-none rounded-full cursor-pointer w-10 h-10" size="sm">
                                    <Trash2 className="w-4 h-4 text-black"/>
                                </Button>
                            </article>
                        ))}
                    </ScrollArea>
                   
                </CardContent>
            </Card>
        </div>
    )
}