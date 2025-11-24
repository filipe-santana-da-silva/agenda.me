'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Eye, Palette, Pencil, Trash2 } from 'lucide-react'
import { cancelAppointment } from '../_actions/cancel-appointments'
import { toast } from 'sonner'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { DialogAppointment } from './dialog-appointment'
import { ButtonPickerAppointment } from './button-date'

interface AppointmentListProps {
  times: string[]
}

export type AppointmentWithService = {
  id: string
  appointmentdate: string
  durationhours: number
  childname: string
  contractorname: string
  phone: string
  email: string
  name: string
  time: string 
  service: {
    duration: number
    name: string
    price: number
  }

  proof_url?: string | null
  contract_url?: string | null
  eventname?: string | null
  bagid?: string | null
  recreatorid?: string | null
  recreator_ids?: string[] | null
  responsible_recreatorid?: string | null
  ownerpresent?: boolean
  eventaddress?: string | null
  
  childagegroup?: string | null
  address?: string | null
  outofcity?: boolean | null
  requestedbymother?: boolean | null
  userid?: string | null
  createdat?: string | null
  color_index?: number | null
  created_by?: string | null
}


const COLORS = ['#B794F3', '#F2F27C', '#F3DD94', '#ED7E7E']

export function AppointmentsList({ times }: AppointmentListProps) {
  const searchParams = useSearchParams()
  const date = searchParams.get('date')
  const queryClient = useQueryClient()
  const router = useRouter()
  const [detailAppointment, setDetailAppointment] = useState<AppointmentWithService | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [startEditing, setStartEditing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteAppointment, setToDeleteAppointment] = useState<AppointmentWithService | null>(null)
  const [appointmentColors, setAppointmentColors] = useState<Record<string, number>>({})
  const [availableColors, setAvailableColors] = useState<Record<string, number>>({})

  

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['get-appointments', date],
    queryFn: async () => {
      const activeDate = date ?? format(new Date(), 'yyyy-MM-dd')
      const url = `${process.env.NEXT_PUBLIC_URL}/api/clinic/appointments?date=${activeDate}`
      const response = await fetch(url)
      const json = await response.json()
      return response.ok ? (json as AppointmentWithService[]) : []
    },
    staleTime: 20000,
    refetchInterval: 30000,
  })

  const { data: recreators, isLoading: recreatorsLoading } = useQuery({
    queryKey: ['recreators-map'],
    queryFn: async () => {
      try {
        const supabase = createClient()
        const { data: rows, error } = await supabase.from('Recreator').select('id, name')
        if (error) throw error
        return rows ?? []
      } catch (e) {
        console.error('Failed to load recreators for name map', e)
        return []
      }
    },
    staleTime: 60_000,
  })

  const recreatorNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    if (!recreators) return map
    for (const r of recreators as any[]) {
      if (r && r.id) map[String(r.id)] = r.name ?? ''
    }
    return map
  }, [recreators])

  useMemo(() => {
    if (!data) return
   
    if (Object.keys(appointmentColors).length > 0) return
    const map: Record<string, number> = {}
    for (const a of data) {
      if (typeof a.color_index === 'number') map[String(a.id)] = a.color_index
    }
    if (Object.keys(map).length > 0) setAppointmentColors(map)
   
  }, [data])

  
  const occupantMap = useMemo(() => {
    const map: Record<string, AppointmentWithService[]> = {}
    if (!data) return map

    for (const appointment of data) {
      const durationHours = Number(appointment.durationhours) || (appointment.service?.duration ? (Number(appointment.service.duration) / 60) : 1)

      const requiredSlot = Math.max(1, Math.ceil((durationHours || 0) * 2))
      const normalizedTime = (appointment.time || '').slice(0,5)
      const startIndex = times.indexOf(normalizedTime)
      if (startIndex !== -1) {
        for (let i = 0; i < requiredSlot; i++) {
          const slotIndex = startIndex + i
          if (slotIndex < times.length) {
            const key = times[slotIndex]
            if (!map[key]) map[key] = []
            map[key].push(appointment)
          }
        }
      }
    }
    return map
  }, [data, times])

  async function handleCancelAppointment(appointmentId: string) {
    const response = await cancelAppointment({ appointmentId })
    if (response.error) {
      toast.error(response.error)
      return
    }
   
    queryClient.invalidateQueries({ queryKey: ['get-appointments', date] })
    await refetch()
    toast.success(response.data)
  }

  async function handleConfirmDelete() {
    if (!toDeleteAppointment) return
    await handleCancelAppointment(toDeleteAppointment.id)
    setConfirmOpen(false)
    setToDeleteAppointment(null)
  }

  async function cycleColor(map: Record<string, number>, setMap: React.Dispatch<React.SetStateAction<Record<string, number>>>, key: string) {
   
    const next = (map[key] ?? -1) + 1 >= COLORS.length ? 0 : (map[key] ?? -1) + 1
    
    setMap(prev => ({ ...prev, [key]: next }))

    try {
      const res = await fetch('/api/clinic/appointments/color', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, color_index: next }),
      })
      const jb = await res.json()
      if (!res.ok || jb?.error) {
        console.error('Failed to persist appointment color_index', jb?.error ?? jb)
      
        setMap(prev => ({ ...prev, [key]: map[key] ?? -1 }))
        toast.error('Falha ao salvar cor do agendamento')
      } else {
        queryClient.invalidateQueries({ queryKey: ['get-appointments', date] })
      }
    } catch (err) {
      console.error('Error updating appointment color:', err)
      setMap(prev => ({ ...prev, [key]: map[key] ?? -1 }))
      toast.error('Erro ao atualizar cor')
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card className="w-full h-fit max-w-none">
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle className="text-xl md:text-2xl font-bold">Agendamentos</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <ButtonPickerAppointment />
            <Button className="w-full sm:w-auto" onClick={() => router.push('/private/agenda/new')}>Novo agendamento</Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full h-[calc(100vh-20rem)] lg:h-[calc(100vh-15rem)] pr-4">
            {isLoading ? (
              <p>Carregando agenda...</p>
            ) : (
              times.map((slot, index) => {
                  const occupants = occupantMap[slot] ?? []
                  const hasOccupants = occupants.length > 0
                  const representative = occupants[0]
                  const bgColor = hasOccupants
                    ? COLORS[appointmentColors[representative.id] ?? -1] ?? 'transparent'
                    : COLORS[availableColors[slot] ?? -1] ?? 'transparent'

                  return (
                    <div
                      key={slot + index}
                      className="w-full flex items-center py-2 border-t last:border-b relative"
                      style={{ backgroundColor: bgColor }}
                    >
                      <div className="min-w-16 text-sm font-semibold ml-4">{slot}</div>
                      
                      <div className="absolute left-3 bottom-1 text-xs text-muted-foreground">
                        {representative?.created_by ? `Criado por: ${String(representative.created_by)}` : ''}
                      </div>
                      {hasOccupants ? (
                        <div className="grow text-sm flex flex-col">
                          {occupants.map((occ, occIndex) => {
                            const isFirstSlot = occ.time === slot
                            return (
                              <div key={occ.id + '-' + occIndex} className="flex justify-between items-center py-1">
                                <div className="flex items-center gap-2 font-semibold">
                                  {occ.contractorname}
                                  {isFirstSlot && (
                                    <>
                                      {
                                        (() => {
                                          const anyOcc: any = occ as any
                                          const responsibleId = anyOcc.responsible_recreatorid || anyOcc.responsibleRecreatorId || anyOcc.responsible_recreator_id || anyOcc.recreatorid || null
                                          const resolvedFromMap = responsibleId ? (recreatorNameMap[String(responsibleId)] ?? null) : null
                                          const fallbackName = anyOcc.responsible_recreatorname || anyOcc.responsibleRecreatorName || anyOcc.responsible_recreator_name || anyOcc.recreatorname || anyOcc.recreator_name || null
                                          const responsibleName = resolvedFromMap || fallbackName
                                          return (
                                            <div className="flex items-center gap-2">
                                              <div className="text-sm text-gray-500 ">{occ.phone}</div>
                                              {responsibleName ? <div className="text-sm text-gray-500">- {String(responsibleName)}</div> : null}
                                            </div>
                                          )
                                        })()
                                      }
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                               
                                  {isFirstSlot && (
                                    <>
                                    <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setDetailAppointment(occ)}
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => cycleColor(appointmentColors, setAppointmentColors, occ.id)}
                                        title="Alterar cor"
                                      >
                                        <Palette className="w-8 h-8" />
                                      </Button>
                                     
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setToDeleteAppointment(occ)
                                        setConfirmOpen(true)
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                    </>
                                    
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="grow text-sm text-gray-500">Disponível</div>
                      )}
                    </div>
                  )
                })
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      <DialogAppointment appointment={detailAppointment} startEditing={startEditing} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir este agendamento?
              {toDeleteAppointment && (
                <span className="mt-2 block text-sm text-muted-foreground">
                  {toDeleteAppointment.contractorname} — {toDeleteAppointment.time}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleConfirmDelete} className="ml-2">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
