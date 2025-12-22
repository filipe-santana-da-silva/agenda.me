'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Plus } from 'lucide-react'
import { Suspense } from 'react'
import { deleteAppointment } from '../_actions/delete-appointment'

const CalendarMonth = dynamic(
  () => import('./calendar-month'),
  {
    ssr: false,
    loading: () => <div className="p-4 text-sm text-muted-foreground">Carregando calendário...</div>,
  }
) as any

const CalendarWeek = dynamic(
  () => import('./calendar-week'),
  {
    ssr: false,
    loading: () => <div className="p-4 text-sm text-muted-foreground">Carregando visualização semanal...</div>,
  }
) as any

const DialogAppointment = dynamic(
  () => import('../appointments/dialog-appointment').then(mod => mod.DialogAppointment),
  {
    ssr: false,
    loading: () => <div className="p-4 text-sm text-muted-foreground">Carregando detalhes...</div>,
  }
)

interface AppointmentData {
  id: string
  appointmentdate: string
  durationhours?: number
  childname?: string
  contractorname: string
  phone: string
  email?: string
  name?: string
  time: string
  service?: {
    duration: number
    name: string
    price: number
  }
  proof_url?: string | null
  contract_url?: string | null
  eventname?: string | null
  color_index?: number | null
  created_by?: string | null
  [key: string]: any
}

const COLORS = ['#B794F3', '#F2F27C', '#F3DD94', '#ED7E7E']

export function CalendarContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  // control the currently displayed month to avoid CalendarMonth mounting with today's date
  const [currentMonth, setCurrentMonth] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [visibleStart, setVisibleStart] = useState<string | null>(null)
  const [visibleEnd, setVisibleEnd] = useState<string | null>(null)
  const [detailAppointment, setDetailAppointment] = useState<AppointmentData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteAppointment, setToDeleteAppointment] = useState<AppointmentData | null>(null)
  const [appointmentColors, setAppointmentColors] = useState<Record<string, number>>({})
  const [loadingColors, setLoadingColors] = useState<Set<string>>(new Set())

  // Fetch all appointments for the month - include selectedDate in queryKey to refetch when month changes
  const { data: allAppointments = [], isLoading, refetch, isError, error } = useQuery({
    queryKey: ['all-appointments', visibleStart, visibleEnd, selectedDate],
    queryFn: async () => {
      try {
        // Always request appointments by interval (start/end).
        // Prefer explicit visible range, otherwise compute month range from selectedDate.
        const startStr = visibleStart && visibleEnd
          ? visibleStart
          : format(startOfMonth(parseISO(selectedDate)), 'yyyy-MM-dd')
        const endStr = visibleStart && visibleEnd
          ? visibleEnd
          : format(endOfMonth(parseISO(selectedDate)), 'yyyy-MM-dd')

        const url = `/api/clinic/appointments/all?start=${startStr}&end=${endStr}`
        const response = await fetch(url)
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Failed to fetch appointments. Status:', response.status, 'Error:', errorText)
          throw new Error(`Failed to fetch appointments: ${response.status} - ${errorText}`)
        }
        const json = await response.json()
        return json as AppointmentData[]
      } catch (error) {
        console.error('Error fetching appointments:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 3,
  })

  // Normalize API response to the shape expected by CalendarMonth and CalendarWeek
  const mappedAppointments = (allAppointments || []).map((a: any) => {
    // appointment_date (API) -> appointmentdate (calendar components)
    const appointmentdate = a.appointment_date || a.appointmentdate || null
    // time normalization: prefer appointment_time then time
    const timeRaw = a.appointment_time ?? a.time ?? ''
    const time = typeof timeRaw === 'string' ? timeRaw.slice(0, 5) : ''

    return {
      id: a.id,
      appointmentdate,
      time,
      durationhours: a.durationhours ?? (a.service?.duration ? a.service.duration / 60 : undefined),
      contractorname: a.name ?? a.contractorname ?? a.eventname ?? '',
      phone: a.phone ?? a.phone_number ?? '',
      email: a.email ?? null,
      eventname: a.eventname ?? a.name ?? null,
      color_index: a.color_index ?? 0,
      service: a.service ?? null,
      // include original payload for details dialog
      __raw: a,
    }
  })

  // Color cycle handler with optimistic update
  const handleColorChange = useCallback(
    async (appointmentId: string) => {
      const currentColor = appointmentColors[appointmentId] ?? -1
      const nextColor = (currentColor + 1) % COLORS.length

      // Optimistic update - show new color immediately
      setAppointmentColors((prev) => ({ ...prev, [appointmentId]: nextColor }))
      setLoadingColors((prev) => new Set(prev).add(appointmentId))

      try {
        const res = await fetch('/api/clinic/appointments/color', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: appointmentId, color_index: nextColor }),
        })

        if (!res.ok) throw new Error('Failed to save color')
        
        setLoadingColors((prev) => {
          const newSet = new Set(prev)
          newSet.delete(appointmentId)
          return newSet
        })
        
        // Invalidate the specific query for the currently visible range
        queryClient.invalidateQueries({ queryKey: ['all-appointments', visibleStart, visibleEnd, selectedDate] })
        await refetch()
      } catch (error) {
        console.error('Error updating color:', error)
        // Revert to previous color on error
        setAppointmentColors((prev) => ({ ...prev, [appointmentId]: currentColor }))
        setLoadingColors((prev) => {
          const newSet = new Set(prev)
          newSet.delete(appointmentId)
          return newSet
        })
        toast.error('Erro ao salvar cor')
      }
    },
    [appointmentColors, queryClient, refetch]
  )

  // Delete handler
  const handleDelete = useCallback((appointment: AppointmentData) => {
    setToDeleteAppointment(appointment)
    setConfirmOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!toDeleteAppointment) return

    const response = await deleteAppointment({ appointmentId: toDeleteAppointment.id })
    if (response.error) {
      toast.error(response.error)
      return
    }

    setConfirmOpen(false)
    setToDeleteAppointment(null)
    // Invalidate the specific query for the currently visible range
    queryClient.invalidateQueries({ queryKey: ['all-appointments', visibleStart, visibleEnd, selectedDate] })
    await refetch()
    toast.success(response.data)
  }, [toDeleteAppointment, queryClient, refetch, selectedDate])

  // Refetch appointments when dialog closes (after editing) or when returning from new appointment
  useEffect(() => {
    if (!isDialogOpen) {
      // Delay slightly to ensure edits are saved
      const timer = setTimeout(() => {
        // Force refetch by invalidating the cache for the visible range if available
        queryClient.invalidateQueries({ queryKey: ['all-appointments', visibleStart, visibleEnd, selectedDate] })
        refetch()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isDialogOpen, refetch, selectedDate, visibleStart, visibleEnd, queryClient])

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-4 overflow-x-hidden">
        {/* Header */}
        <Card className="w-full mx-auto max-w-full">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold">Agenda</CardTitle>
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1 sm:gap-2 bg-muted p-1 rounded-lg">
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className="gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Mês</span>
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
                >
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Semana</span>
                </Button>
              </div>
            <Button
  onClick={() => router.push('/private/agenda/new')}
  className="relative w-full sm:w-auto text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center"
>
  <span className="mx-auto">Novo Agendamento</span>
</Button>


            </div>
          </CardHeader>
        </Card>

        {/* Loading state: keep calendar mounted during loading to avoid remount flicker */}
        {isLoading && (
          <div className="p-2">
            <div className="text-sm text-muted-foreground mb-2">Carregando agenda...</div>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8">
              <div className="text-center">
                <p className="text-red-800 font-semibold mb-2">Erro ao carregar agenda</p>
                <p className="text-red-600 text-sm mb-4">{error?.message || 'Tente novamente mais tarde'}</p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-100"
                >
                  Tentar novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar Views */}
        {!isLoading && !isError && (
          <Card className="w-full mx-auto overflow-hidden border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6 h-[500px] sm:h-[600px] lg:h-[700px] overflow-y-auto overflow-x-hidden">
              <Suspense fallback={<div className="p-4 text-muted-foreground">Carregando...</div>}>
                {viewMode === 'month' ? (
                  <div className="p-2 sm:p-0">
                    <CalendarMonth
                      appointments={mappedAppointments}
                      selectedDate={selectedDate}
                      currentMonth={currentMonth}
                      onCurrentMonthChange={(iso: string) => setCurrentMonth(iso)}
                      onDateSelect={(date: string) => {
                        setSelectedDate(date)
                        setViewMode('week')
                      }}
                      onAppointmentClick={(id: string) => {
                        const apt = allAppointments.find(a => a.id === id)
                        if (apt) {
                          setDetailAppointment(apt)
                          setIsDialogOpen(true)
                        }
                      }}
                      onRangeChange={(s: string, e: string) => {
                        setVisibleStart(s)
                        setVisibleEnd(e)
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-2 sm:p-0">
                    <CalendarWeek
                      appointments={mappedAppointments}
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      onAppointmentClick={(id: string) => {
                        const apt = allAppointments.find(a => a.id === id)
                        if (apt) {
                          setDetailAppointment(apt)
                          setIsDialogOpen(true)
                        }
                      }}
                      onColorChange={handleColorChange}
                      onDelete={(appointmentId: string) => {
                        const apt = allAppointments.find(a => a.id === appointmentId)
                        if (apt) {
                          handleDelete(apt)
                        }
                      }}
                      loadingColors={loadingColors}
                    />
                  </div>
                )}
              </Suspense>
            </CardContent>
          </Card>
        )}

        {/* Appointment details dialog */}
        <DialogAppointment
          appointment={detailAppointment as any}
          startEditing={false}
        />

        {/* Delete confirmation dialog */}
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
              <Button onClick={handleConfirmDelete} className="ml-2">
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Dialog>
  )
}
