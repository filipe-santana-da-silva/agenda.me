'use client'

import { useState } from "react"
import dynamic from "next/dynamic"

// Lightweight local Reminder type to avoid depending on generated prisma types
// The app only uses `id` and `description` here, but we include a couple of
// optional fields that may exist in the DB for forward compatibility.
type ReminderItem = {
    id: string
    description: string
    userId?: string | null
    createdat?: string | null
}
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card"
import { Plus, Trash2, NotebookPen, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { deleteReminder } from "../_actions/delete-reminder"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"

const Reminderlist = dynamic(() => import("./reminder-list").then(mod => mod.Reminderlist), {
  ssr: false,
  loading: () => <div className="p-2 text-sm text-muted-foreground">Carregando lembretes...</div>
})

interface ReminderListProps {
    reminder: ReminderItem[]
    onRefresh?: () => void
}


export function ReminderList({ reminder, onRefresh } : ReminderListProps){

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleConfirmDelete(){
        if (!reminderToDelete) return
        
        setIsDeleting(true)
        const response = await deleteReminder({ reminderId: reminderToDelete})

        if(response.error){
            toast.error(response.error)
            setIsDeleting(false)
            return
        }
        toast.success(response.data);
        setDeleteDialogOpen(false)
        setReminderToDelete(null)
        setIsDeleting(false)
        if (onRefresh) onRefresh();
    }

    function handleDeleteReminder(id: string){
        setReminderToDelete(id)
        setDeleteDialogOpen(true)
    }
    return(
        <div className="flex flex-col gap-3">
            <Card className="border-2 border-blue-200 shadow-lg bg-linear-to-br from-blue-50 to-indigo-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-blue-200">
                    <div className="flex justify-center items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <NotebookPen className="w-5 h-5 text-white"/> 
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold text-blue-900">Lembretes</CardTitle>
                            <p className="text-xs text-blue-700 mt-1">{reminder.length} {reminder.length === 1 ? 'lembrete' : 'lembretes'}</p>
                        </div>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 p-0 shadow-md">
                                <Plus className="w-5 h-5"/>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-106.25">
                            <DialogHeader>
                                <DialogTitle>Novo lembrete</DialogTitle>
                                <DialogDescription>Criar um novo lembrete para sua lista</DialogDescription>
                                <div>
                                    <Reminderlist closeDialog={() => setIsDialogOpen(false)} onRefresh={onRefresh} />
                                </div>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="pt-4">
                    {reminder.length === 0  && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-300 mb-3"/>
                            <p className="text-sm text-gray-500">Nenhum lembrete registrado</p>
                            <p className="text-xs text-gray-400 mt-1">Clique em + para criar um novo</p>
                        </div>
                    )}
                    <ScrollArea className="h-85 lg:max-h-[calc(100vh - 15rem)] w-full">
                        <div className="pr-4">
                            {reminder.map((item) => (
                                <div key={item.id} className="flex flex-row items-start justify-between py-3 px-3 bg-white mb-2 rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <p className="text-sm lg:text-base text-gray-900 wrap-break-words">{item.description}</p>
                                    </div>
                                    <Button 
                                        onClick={() => handleDeleteReminder(item.id)} 
                                        className="bg-transparent hover:bg-red-50 shadow-none rounded-lg cursor-pointer w-9 h-9 p-0 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                                        size="sm"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Delete confirmation dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja deletar este lembrete? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost">Cancelar</Button>
                        </DialogClose>
                        <Button 
                            onClick={handleConfirmDelete} 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deletando...' : 'Deletar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}