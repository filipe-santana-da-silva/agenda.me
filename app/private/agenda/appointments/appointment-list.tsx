'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
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

const DialogAppointment = dynamic(() => import('./dialog-appointment').then(mod => mod.DialogAppointment), { 
  ssr: false,
  loading: () => <div className="p-4 text-sm text-muted-foreground">Carregando detalhes...</div> 
})
import { ButtonPickerAppointment } from './button-date'

interface AppointmentListProps {
  times: string[]
}

export type AppointmentWithService = {
  id: string
  appointment_date: string
  appointment_time: string
  status: string | null
  customer_id: string | null
  service_id: string | null
  professional_id?: string | null
  created_at: string | null
  updated_at: string | null
  time?: string
  appointmentdate?: string
  durationhours?: number
  contractorname?: string
  phone?: string
  email?: string
  name?: string
  eventname?: string
  color_index?: number
  responsible_recreatorid?: string
  responsible_recreatorname?: string
  customer?: {
    id: string
    name: string
    email: string
    phone: string
  }
  service?: {
    id: string
    name: string
    duration: number
    price: number
  }
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
      // Request by interval (start=end=activeDate) to avoid per-day-specific route differences
      const url = `/api/clinic/appointments/all?start=${activeDate}&end=${activeDate}`
      const response = await fetch(url)
      const json = await response.json()
      return response.ok ? (json as AppointmentWithService[]) : []
    },
    staleTime: 60000,
    refetchInterval: 120000,
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
        // Improve error visibility: log known supabase error fields and full object
        try {
          // Some errors from supabase are plain objects without enumerable properties
          const safe = JSON.stringify(e, Object.getOwnPropertyNames(e), 2)
          console.error('Failed to load recreators for name map — full error:', safe)
        } catch (err) {
          console.error('Failed to load recreators for name map (could not stringify error):', e)
        }
        // Also log env vars that the client uses (sanitized) to help debugging
        try {
          console.debug('NEXT_PUBLIC_SUPABASE_URL present?', Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL))
          console.debug('NEXT_PUBLIC_SUPABASE_ANON_KEY present?', Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
        } catch (err) {
          // ignore in browser
        }

        // If the error indicates an expired JWT, clear the local session and prompt re-login.
        // This helps recovery when the refresh token expired or auth state is invalid.
        try {
          const supabase = createClient()
          const msg = String((e as Record<string, unknown>)?.message || '').toLowerCase()
          if ((e as Record<string, unknown>)?.code === 'PGRST303' || msg.includes('jwt expired') || msg.includes('token expired')) {
            console.warn('Detected expired JWT/session for Supabase — signing out local session and reloading.')
            try {
              await supabase.auth.signOut()
            } catch (signOutErr) {
              console.warn('supabase.auth.signOut() failed:', signOutErr)
            }
            try {
              // Notify the user and reload so they'll be prompted to re-authenticate.
              // `toast` is available in this module.
              toast.error('Sessão expirada. Por favor, faça login novamente.')
            } catch (tErr) {
              // ignore toast failures
            }
            // reload page to clear any in-memory state and trigger auth flow
            try { window.location.reload() } catch (rErr) { /* ignore */ }
          }
        } catch (err) {
          // ignore
        }

        return []
      }
    },
    staleTime: 60_000,
  })

  const recreatorNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    if (!recreators) return map
    for (const r of recreators as Array<Record<string, unknown>>) {
      if (r && r.id) map[String(r.id)] = r.name ?? ''
    }
    return map
  }, [recreators])

  useMemo(() => {
    if (!data) return
   
    const map: Record<string, number> = {}
    for (const a of data) {
      if (typeof a.color_index === 'number') {
        map[String(a.id)] = a.color_index
      }
    }
    setAppointmentColors(map)
   
  }, [data])

  
  const occupantMap = useMemo(() => {
    const map: Record<string, AppointmentWithService[]> = {}
    if (!data) return map

    for (const appointment of data) {
      // Map only by appointment start time so multiple appointments that start
      // in the same slot stack under that slot. We do not duplicate the same
      // appointment across subsequent 30min slots here.
      const normalizedTime = (appointment.time || '').slice(0,5)
      const startIndex = times.indexOf(normalizedTime)
      if (startIndex !== -1) {
        const key = times[startIndex]
        if (!map[key]) map[key] = []
        map[key].push(appointment)
      }
    }
    return map
  }, [data, times])

  // coverageMap marks every slot that is occupied by an appointment's duration
  // so we can visually indicate occupied slots even when the appointment
  // doesn't start in that slot.
  const coverageMap = useMemo(() => {
    const map: Record<string, AppointmentWithService[]> = {}
    if (!data) return map

    // Iterate appointments sorted by start index so coverage order is stable
    const sorted = [...data].sort((a, b) => {
      const ta = (a.time || '').slice(0,5)
      const tb = (b.time || '').slice(0,5)
      const ia = times.indexOf(ta)
      const ib = times.indexOf(tb)
      return ia - ib
    })

    for (const appointment of sorted) {
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
                  // Do not use a single slot background color. We'll color rows per-appointment instead.
                  const representative = occupants[0]

                  return (
                    <div
                      key={slot + index}
                      className="w-full flex items-center py-2 border-t last:border-b relative"
                    >
                      <div className="min-w-16 text-sm font-semibold ml-4">{slot}</div>
                      
                      <div className="grow text-sm flex flex-col space-y-2">
                        {hasOccupants ? (
                          // If there are starters in this slot, render them stacked and
                          // do NOT mix in continued appointments that started earlier.
                          occupants.map((occ: Record<string, unknown>, occIndex: number) => {
                            const isFirstSlot = occ.time === slot
                            const responsibleId = (occ.responsible_recreatorid || occ.responsibleRecreatorId || occ.responsible_recreator_id || occ.recreatorid) as string | null || null
                            const resolvedFromMap = responsibleId ? (recreatorNameMap[String(responsibleId)] ?? null) : null
                            const fallbackName = (occ.responsible_recreatorname || occ.responsibleRecreatorName || occ.responsible_recreator_name || occ.recreatorname || occ.recreator_name) as string || null
                            const responsibleName = resolvedFromMap || fallbackName

                            return (
                              <div
                                key={occ.id + '-' + occIndex}
                                className="w-full py-2 px-3 border-l-4 rounded-r-md"
                                style={{ 
                                  backgroundColor: (appointmentColors[occ.id] !== undefined) ? (COLORS[appointmentColors[occ.id]] ?? '#f5f5f5') : '#f5f5f5',
                                  borderLeftColor: (appointmentColors[occ.id] !== undefined) ? (COLORS[appointmentColors[occ.id]] ?? '#e0e0e0') : '#e0e0e0',
                                  opacity: 0.8
                                }}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <div className="flex flex-col">
                                    <div className="font-semibold text-amber-900">{occ.contractorname}</div>
                                    <div className="text-sm text-gray-600 mt-0.5">
                                      {occ.phone}{responsibleName ? ` — ${String(responsibleName)}` : ''}
                                      {occ.eventname ? <span className="text-sm text-gray-500 ml-2">{occ.eventname}</span> : null}
                                    </div>
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
                                          <Palette className="w-6 h-6" />
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
                              </div>
                            )
                          })
                        ) : (
                       
                          (() => {
                            const covered = coverageMap[slot] ?? []
                            if (covered.length === 0) return <div className="text-sm text-gray-500">Disponível</div>
                            return (
                              <div className="flex flex-col space-y-1">
                                {covered.map((c) => (
                                  <div key={`cov-${c.id}`} className="w-full py-2 px-3 border-l-4 rounded-r-md" style={{ 
                                    backgroundColor: (appointmentColors[c.id] !== undefined) ? (COLORS[appointmentColors[c.id]] ?? '#f5f5f5') : '#f5f5f5',
                                    borderLeftColor: (appointmentColors[c.id] !== undefined) ? (COLORS[appointmentColors[c.id]] ?? '#e0e0e0') : '#e0e0e0',
                                    opacity: 0.6
                                  }}>
                                    <div className="flex justify-between items-center w-full">
                                      <div className="flex flex-col">
                                        <div className="font-semibold text-amber-900">{c.contractorname} <span className="text-xs text-gray-500">(em andamento)</span></div>
                                        <div className="text-sm text-gray-600 mt-0.5">{c.phone}</div>
                                      </div>
                                      <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: (appointmentColors[c.id] !== undefined) ? (COLORS[appointmentColors[c.id]] ?? 'transparent') : 'transparent' }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          })()
                        )}
                      </div>
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
