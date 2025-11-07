'use client'

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Eye, Palette, Pencil, Trash2 } from "lucide-react"
import { cancelAppointment } from "../_actions/cancel-appointments"
import { toast } from "sonner"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { DialogAppointment } from "./dialog-appointment"
import { ButtonPickerAppointment } from "./button-date"

interface AppointmentListProps {
  times: string[]
}

export type AppointmentWithService = Prisma.AppointmentGetPayload<{
  include: {
    service: true
  }
}>

const COLORS = ["#B794F3", "#F2F27C", "#F3DD94", "#ED7E7E"]

export function AppointmentsList({ times }: AppointmentListProps) {
  const searchParams = useSearchParams()
  const date = searchParams.get("date")
  const queryClient = useQueryClient()
  const [detailAppointment, setDetailAppointment] = useState<AppointmentWithService | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [appointmentColors, setAppointmentColors] = useState<Record<string, number>>({})
  const [availableColors, setAvailableColors] = useState<Record<string, number>>({})

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["get-appointments", date],
    queryFn: async () => {
      let activeDate = date
      if (!activeDate) {
        const today = format(new Date(), "yyyy-MM-dd")
        activeDate = today
      }
      const url = `${process.env.NEXT_PUBLIC_URL}/api/clinic/appointments?date=${activeDate}`
      const response = await fetch(url)
      const json = await response.json() as AppointmentWithService[]
      if (!response.ok) {
        return []
      }
      return json
    },
    staleTime: 20000,
    refetchInterval: 30000
  })

  const occupantMap: Record<string, AppointmentWithService> = {}

  if (data && data.length > 0) {
    for (const appointment of data) {
      const requiredSlot = Math.ceil(appointment.service.duration / 30)
      const startIndex = times.indexOf(appointment.time)
      if (startIndex !== -1) {
        for (let i = 0; i < requiredSlot; i++) {
          const slotIndex = startIndex + i
          if (slotIndex < times.length) {
            occupantMap[times[slotIndex]] = appointment
          }
        }
      }
    }
  }

  async function handleCancelAppointment(appointmentId: string) {
    const response = await cancelAppointment({ appointmentId })
    if (response.error) {
      toast.error(response.error)
      return
    }
    queryClient.invalidateQueries({ queryKey: ["get-appointments"] })
    await refetch()
    toast.success(response.data)
  }

  function cycleAppointmentColor(id: string) {
    setAppointmentColors(prev => ({
      ...prev,
      [id]: (prev[id] ?? -1) + 1 >= COLORS.length ? 0 : (prev[id] ?? -1) + 1
    }))
  }

  function cycleAvailableColor(slot: string) {
    setAvailableColors(prev => ({
      ...prev,
      [slot]: (prev[slot] ?? -1) + 1 >= COLORS.length ? 0 : (prev[slot] ?? -1) + 1
    }))
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card className="w-full max-w-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl md:text-2xl font-bold">Agendamentos</CardTitle>
          <ButtonPickerAppointment />
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full h-[calc(100vh-20rem)] lg:h-[calc(100vh-15rem)] pr-4">
            {isLoading ? (
              <p>Carregando agenda...</p>
            ) : (
              times.map((slot, index) => {
                const occupant = occupantMap[slot]
                const isFirstSlot = occupant && occupant.time === slot
                const bgColor = occupant
                  ? COLORS[appointmentColors[occupant.id] ?? -1] ?? "transparent"
                  : COLORS[availableColors[slot] ?? -1] ?? "transparent"

                return (
                  <div
                    key={slot + index}
                    className="w-full flex items-center py-2 border-t last:border-b"
                    style={{ backgroundColor: bgColor }}
                  >
                    <div className="min-w-[4rem] text-sm font-semibold ml-4">{slot}</div>
                    {occupant ? (
                      <>
                        <div className="flex-grow text-sm flex flex-col">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-semibold">
                              {occupant.name}
                              {isFirstSlot && (
                                <>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="bg-transparent hover:bg-transparent focus:outline-none focus:ring-0 cursor-pointer" onClick={() => setDetailAppointment(occupant)}>
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="bg-transparent hover:bg-transparent focus:outline-none focus:ring-0 cursor-pointer"
                                    onClick={() => cycleAppointmentColor(occupant.id)}
                                    title="Alterar cor"
                                  >
                                    <Palette className="w-8 h-8" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="bg-transparent hover:bg-transparent focus:outline-none focus:ring-0 cursor-pointer">
                                    <Pencil className="w-4 h-4"/>
                                  </Button>
                                  
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">{occupant.phone}</div>
                        </div>
                        {isFirstSlot && (
                          <div className="ml-2 p-2">
                            <Button variant="ghost" size="icon" className="bg-transparent hover:bg-transparent focus:outline-none focus:ring-0 cursor-pointer" onClick={() => handleCancelAppointment(occupant.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex-grow text-sm text-gray-500">Disponível</div>
                      </>
                    )}
                  </div>
                )
              })
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      <DialogAppointment appointment={detailAppointment} />
    </Dialog>
  )
}
