'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Clock, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

const TimelineTimer = dynamic(() => import('@/app/private/agenda/_components/timeline-timer').then(mod => ({ default: mod.TimelineTimer })), {
  ssr: false,
})

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status?: string | null
  name?: string
  eventname?: string
  color_index?: number
  phone?: string
  email?: string
  customer_id?: string
  service_id?: string
  professional_id?: string
  created_at?: string
  updated_at?: string
  service?: {
    id: string
    name: string
    duration: number
    price: number
  }
  professional?: {
    id: string
    name: string
    email: string
    position?: string
  }
}

const COLORS = ['#B794F3', '#F2F27C', '#F3DD94', '#ED7E7E']

export function CalendarViewWithAppointments() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAppointmentIndex, setSelectedAppointmentIndex] = useState(0)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<{
    date: string
    time: string
    status: string
    customer_id: string
    service_id: string
    professional_id: string
  }>({ date: '', time: '', status: '', customer_id: '', service_id: '', professional_id: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([])
  const [services, setServices] = useState<{ id: string; name: string; price_in_cents: number }[]>([])
  const [professionals, setProfessionals] = useState<{ id: string; name: string }[]>([])
  const [showTimelineTimer, setShowTimelineTimer] = useState(false)

  // Reset appointment index and editing state when selected date changes
  useEffect(() => {
    setSelectedAppointmentIndex(0)
    setIsEditing(false)
  }, [selectedDate])

  // Reset editing state when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setIsEditing(false)
    }
  }, [isDialogOpen])

  // Invalidate cache when component mounts (called when returning from new appointment form)
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth)
    queryClient.invalidateQueries({
      queryKey: ['appointments-month', format(monthStart, 'yyyy-MM')],
    })
  }, [currentMonth, queryClient])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 })

  // Fetch appointments for current month
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['appointments-month', format(monthStart, 'yyyy-MM')],
    queryFn: async () => {
      const start = format(monthStart, 'yyyy-MM-dd')
      const end = format(monthEnd, 'yyyy-MM-dd')
      const params = new URLSearchParams({ start, end })
      const url = `/api/clinic/appointments/all?${params.toString()}`
      try {
        const response = await fetch(url, { credentials: 'include' })
        const data = await response.json()
        console.log('Agendamentos recebidos:', { start, end, url, count: data?.length || 0, data })
        return response.ok ? data : []
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error)
        return []
      }
    },
    staleTime: 60000,
  })

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    return appointments.reduce((acc: Record<string, Appointment[]>, apt: Appointment) => {
      const date = apt.appointment_date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(apt)
      return acc
    }, {} as Record<string, Appointment[]>)
  }, [appointments])

  // Load edit data and fetch lists when dialog opens
  useEffect(() => {
    if (isDialogOpen && selectedDate && appointmentsByDate[selectedDate]?.[selectedAppointmentIndex]) {
      const apt = appointmentsByDate[selectedDate][selectedAppointmentIndex]
      setEditData({
        date: apt.appointment_date,
        time: apt.appointment_time.substring(0, 5),
        status: apt.status || 'pending',
        customer_id: apt.customer_id || '',
        service_id: apt.service_id || '',
        professional_id: apt.professional_id || ''
      })
    }
  }, [isDialogOpen, selectedDate, selectedAppointmentIndex, appointmentsByDate])

  // Fetch customers, services and professionals when editing
  useEffect(() => {
    if (isEditing) {
      const fetchData = async () => {
        try {
          const [customersRes, servicesRes, professionalsRes] = await Promise.all([
            fetch('/api/customers'),
            fetch('/api/services'),
            fetch('/api/employees')
          ])
          const [customersData, servicesData, professionalsData] = await Promise.all([
            customersRes.json(),
            servicesRes.json(),
            professionalsRes.json()
          ])
          setCustomers(customersData || [])
          setServices(servicesData || [])
          setProfessionals(professionalsData || [])
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
      fetchData()
    }
  }, [isEditing])

  // Debug: show grouped appointments keys
  if (typeof window !== 'undefined') {
    console.log('Appointments array:', appointments)
    console.log('Appointments grouped by date:', appointmentsByDate)
    console.log('Example appointment_date field:', appointments[0]?.appointment_date)
    const keys = Object.keys(appointmentsByDate)
    console.log('GroupedByDate keys:', keys)
  }
  // Use startOfWeek and endOfWeek to get the correct week boundaries
  const monthWeekStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // 0 = Sunday
  const monthWeekEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  
  const allDays = eachDayOfInterval({
    start: monthWeekStart,
    end: monthWeekEnd,
  })

  const weeks = Array.from({ length: Math.ceil(allDays.length / 7) }, (_, i) =>
    allDays.slice(i * 7, i * 7 + 7)
  )

  return (
    <div className="space-y-4">
      {/* Novo Agendamento Button */}
      <div className="flex justify-end gap-2">
        <Button 
          onClick={() => {
            const bookingUrl = `${window.location.origin}/booking`
            navigator.clipboard.writeText(bookingUrl)
            toast.success('Link copiado para a área de transferência!')
          }}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Link de Agendamento
        </Button>
        <Button 
          onClick={() => router.push('/private/agenda/new')}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          data-tour="new-appointment"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Button>
      </div>

      <Card className="border-2 border-blue-200 shadow-lg">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <CardTitle className="text-lg md:text-2xl">
              {viewMode === 'month'
                ? format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })
                : `Semana de ${format(weekStart, 'dd/MM', { locale: ptBR })} a ${format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}`}
            </CardTitle>
            {/* View Mode Tabs */}
            <div className="flex gap-2 border-b-2 border-gray-200 md:ml-4">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 md:px-4 md:py-2 text-sm font-semibold transition-all ${
                  viewMode === 'month'
                    ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 md:px-4 md:py-2 text-sm font-semibold transition-all ${
                  viewMode === 'week'
                    ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setShowTimelineTimer(!showTimelineTimer)}
                className={`px-3 py-1.5 md:px-4 md:py-2 text-sm font-semibold transition-all flex items-center gap-2 ${
                  showTimelineTimer
                    ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                Timeline
              </button>
            </div>
          </div>
          <div className="flex gap-2" data-tour="week-nav">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (viewMode === 'month') {
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                } else {
                  setCurrentWeek(subWeeks(currentWeek, 1))
                }
              }}
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (viewMode === 'month') {
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                } else {
                  setCurrentWeek(addWeeks(currentWeek, 1))
                }
              }}
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Timeline Timer */}
      {showTimelineTimer && (
        <CardContent className="pb-4">
          <TimelineTimer duration={60} />
        </CardContent>
      )}

      <CardContent>
        {viewMode === 'month' ? (
          <>
            {/* Month View - Mobile List */}
            <div className="md:hidden space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {allDays.filter(day => isSameMonth(day, currentMonth)).map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const dayAppointments = appointmentsByDate[dateStr] || []
                const isDayToday = isToday(day)
                
                return (
                  <div key={dateStr} className="border rounded-lg overflow-hidden">
                    <div className={`p-3 font-semibold ${
                      isDayToday ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                    }`}>
                      {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </div>
                    <div className="p-3 space-y-2">
                      {dayAppointments.length > 0 ? (
                        dayAppointments.map((apt: Appointment) => (
                          <div
                            key={apt.id}
                            onClick={() => {
                              setSelectedDate(dateStr)
                              setSelectedAppointmentIndex(dayAppointments.indexOf(apt))
                              setIsDialogOpen(true)
                            }}
                            className="flex items-center gap-3 p-3 bg-white border-l-4 rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow relative group"
                            style={{ borderLeftColor: COLORS[apt.color_index || 0] }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setAppointmentToDelete(apt.id)
                                setDeleteDialogOpen(true)
                              }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white hover:bg-gray-100 text-red-500 rounded-full p-1 transition-opacity shadow-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="shrink-0 text-center">
                              <div className="text-xs text-gray-500">Hora</div>
                              <div className="text-sm font-bold text-gray-900">{apt.appointment_time.substring(0, 5)}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 truncate">{apt.name || apt.eventname || 'Agendamento'}</div>
                              {apt.service && (
                                <div className="text-xs text-gray-600 truncate">
                                  {typeof apt.service === 'string' ? apt.service : apt.service?.name}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          Sem agendamentos
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Month View - Desktop Grid */}
            <div className="hidden md:block">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                  <div key={day} className="text-center font-bold text-gray-700 text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

            <div className="space-y-2" data-tour="calendar-grid">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                  {week.map((day, dayIndex) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const dayAppointments = appointmentsByDate[dateStr] || []
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isDayToday = isToday(day)

                    return (
                      <div
                        key={dayIndex}
                        onClick={() => {
                          console.log('Dia clicado:', day, 'Data formatada:', dateStr)
                          setSelectedDate(dateStr)
                          setIsDialogOpen(true)
                        }}
                        className={`min-h-32 p-2 rounded-lg border-2 transition-all cursor-pointer ${
                          !isCurrentMonth
                            ? 'bg-gray-50 border-gray-200'
                            : isDayToday
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : dayAppointments.length > 0
                                ? 'border-orange-300 bg-orange-50'
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div
                          className={`text-sm font-bold mb-1 ${
                            isDayToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {format(day, 'd')}
                        </div>

                        {dayAppointments.length > 0 ? (
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map((apt: Appointment) => (
                              <div
                                key={apt.id}
                                className="text-xs p-1 rounded bg-white truncate cursor-pointer hover:shadow-sm transition-shadow relative group"
                                style={{
                                  borderLeft: `4px solid ${COLORS[apt.color_index || 0]}`,
                                }}
                                title={`${apt.appointment_time} - ${apt.name || apt.eventname || 'Agendamento'}`}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setAppointmentToDelete(apt.id)
                                    setDeleteDialogOpen(true)
                                  }}
                                  className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-white hover:bg-gray-100 text-red-500 rounded-full p-1 transition-opacity shadow-md"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                                <span className="font-semibold text-gray-900">
                                  {apt.appointment_time.substring(0, 5)}
                                </span>
                                <span className="text-gray-600 ml-1">
                                  {apt.name?.substring(0, 10) || apt.eventname?.substring(0, 10) || 'Apt'}
                                </span>
                              </div>
                            ))}

                            {dayAppointments.length > 2 && (
                              <div className="text-xs p-1 text-center font-bold text-blue-600 bg-blue-100 rounded">
                                +{dayAppointments.length - 2}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic">
                            {isCurrentMonth ? 'Sem agendamentos' : ''}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            </div>

            <div className="hidden md:block mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Legenda</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="text-xs text-gray-600">Hoje</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }}></div>
                  <span className="text-xs text-gray-600">Com agendamentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-xs text-gray-600">Sem agendamentos</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Week View - Mobile List */}
            <div className="md:hidden space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000)
                const dateStr = format(date, 'yyyy-MM-dd')
                const dayAppointments = appointmentsByDate[dateStr] || []
                const isDayToday = isToday(date)
                
                return (
                  <div key={dateStr} className="border rounded-lg overflow-hidden">
                    <div className={`p-3 font-semibold ${
                      isDayToday ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                    }`}>
                      {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </div>
                    <div className="p-3 space-y-2">
                      {dayAppointments.length > 0 ? (
                        dayAppointments.map((apt: Appointment) => (
                          <div
                            key={apt.id}
                            onClick={() => {
                              setSelectedDate(dateStr)
                              setSelectedAppointmentIndex(dayAppointments.indexOf(apt))
                              setIsDialogOpen(true)
                            }}
                            className="flex items-center gap-3 p-3 bg-white border-l-4 rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow relative group"
                            style={{ borderLeftColor: COLORS[apt.color_index || 0] }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setAppointmentToDelete(apt.id)
                                setDeleteDialogOpen(true)
                              }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white hover:bg-gray-100 text-red-500 rounded-full p-1 transition-opacity shadow-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="shrink-0 text-center">
                              <div className="text-xs text-gray-500">Hora</div>
                              <div className="text-sm font-bold text-gray-900">{apt.appointment_time.substring(0, 5)}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 truncate">{apt.name || apt.eventname || 'Agendamento'}</div>
                              {apt.service && (
                                <div className="text-xs text-gray-600 truncate">
                                  {typeof apt.service === 'string' ? apt.service : apt.service?.name}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          Sem agendamentos
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Week View - Desktop Grid */}
            <div className="hidden md:block">
            <div className="grid grid-cols-7 gap-1 mb-2 bg-gray-50 p-2 rounded">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000)
                const isDayToday = isToday(date)
                return (
                  <div 
                    key={i} 
                    className={`text-center py-3 rounded transition-all ${
                      isDayToday 
                        ? 'bg-blue-500 text-white font-bold shadow-md' 
                        : 'bg-white hover:bg-blue-50'
                    }`}
                  >
                    <div className="font-bold text-sm">
                      {format(date, 'EEE', { locale: ptBR })}
                    </div>
                    <div className="text-lg font-bold">
                      {format(date, 'dd')}
                    </div>
                    <div className="text-xs opacity-75">
                      {format(date, 'MMM', { locale: ptBR })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Week appointments with hourly grid */}
            <div className="flex gap-1 border border-gray-200 rounded overflow-x-auto">
              {/* Time column */}
              <div className="flex flex-col bg-gray-50 border-r border-gray-200">
                <div className="h-12 w-16"></div>
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div 
                    key={hour}
                    className="h-16 w-16 border-b border-gray-200 text-xs font-semibold text-gray-600 p-1 text-center"
                  >
                    {String(hour).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Days columns */}
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000)
                const dateStr = format(date, 'yyyy-MM-dd')
                const dayAppointments = appointmentsByDate[dateStr] || []
                const isDayToday = isToday(date)

                return (
                  <div
                    key={i}
                    className={`flex-1 min-w-fit relative border-r border-gray-200 ${
                      isDayToday ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    {/* Hour grid lines */}
                    {Array.from({ length: 24 }).map((_, hour) => (
                      <div
                        key={hour}
                        className="h-16 border-b border-gray-100 relative"
                      />
                    ))}

                    {/* Appointments positioned by time */}
                    {dayAppointments.map((apt: Appointment) => {
                      const [hours, minutes] = apt.appointment_time.split(':').map(Number)
                      const topOffset = hours * 64 + (minutes / 60) * 64
                      return (
                        <div
                          key={apt.id}
                          onClick={() => {
                            setSelectedDate(dateStr)
                            setIsDialogOpen(true)
                          }}
                          className="absolute left-0.5 right-0.5 p-1 rounded cursor-pointer transition-all hover:shadow-lg z-10 group"
                          style={{
                            backgroundColor: COLORS[apt.color_index || 0],
                            top: `${topOffset + 48}px`,
                            height: '60px',
                            minHeight: '48px',
                          }}
                          title={`${apt.appointment_time} - ${apt.name || apt.eventname || 'Agendamento'}`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setAppointmentToDelete(apt.id)
                              setDeleteDialogOpen(true)
                            }}
                            className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-white hover:bg-gray-100 text-red-500 rounded-full p-1 transition-opacity shadow-md"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <div className="text-xs font-bold text-white truncate">
                            {apt.appointment_time.substring(0, 5)}
                          </div>
                          <div className="text-xs text-white font-semibold truncate">
                            {apt.name?.substring(0, 15) || apt.eventname?.substring(0, 15) || 'Apt'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Day Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
            <p className="text-sm text-gray-600 mt-1">Informações do cliente e serviço</p>
          </DialogHeader>

          {selectedDate && appointmentsByDate[selectedDate]?.length > 0 ? (
            <div className="space-y-4">
              {/* Navigation for multiple appointments */}
              {appointmentsByDate[selectedDate].length > 1 && (
                <div className="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAppointmentIndex(prev => 
                      prev === 0 ? appointmentsByDate[selectedDate].length - 1 : prev - 1
                    )}
                  >
                    ← Anterior
                  </Button>
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedAppointmentIndex + 1} de {appointmentsByDate[selectedDate].length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAppointmentIndex(prev => 
                      prev === appointmentsByDate[selectedDate].length - 1 ? 0 : prev + 1
                    )}
                  >
                    Próximo →
                  </Button>
                </div>
              )}

              {/* Current appointment details */}
              {appointmentsByDate[selectedDate][selectedAppointmentIndex] && (
                <div className="space-y-4">
                  {(() => {
                    const apt = appointmentsByDate[selectedDate][selectedAppointmentIndex]
                    return (
                      <>
                        {/* Data e Hora */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Data</p>
                            <p className="text-lg font-bold text-gray-900">
                              {selectedDate.split('-').reverse().join('/')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase">Hora</p>
                            <p className="text-lg font-bold text-gray-900">{apt.appointment_time.substring(0, 5)}</p>
                          </div>
                        </div>

                        {/* Cliente */}
                        <div className="border-t pt-4">
                          <p className="text-sm font-bold text-gray-900 mb-2">Cliente</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-900">
                              <span className="font-semibold">Nome:</span> {apt.name || apt.eventname || 'N/A'}
                            </p>
                            {apt.phone && (
                              <p className="text-gray-900">
                                <span className="font-semibold">Telefone:</span> {apt.phone}
                              </p>
                            )}
                            {apt.email && (
                              <p className="text-gray-900">
                                <span className="font-semibold">Email:</span> {apt.email}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Serviço */}
                        {apt.service && (
                          <div className="border-t pt-4">
                            <p className="text-sm font-bold text-gray-900 mb-2">Serviço</p>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-900">
                                <span className="font-semibold">Nome:</span>{' '}
                                {typeof apt.service === 'string' ? apt.service : apt.service?.name || 'N/A'}
                              </p>
                              {typeof apt.service === 'object' && apt.service?.duration && (
                                <p className="text-gray-900">
                                  <span className="font-semibold">Duração:</span> {apt.service.duration}:00:00 minutos
                                </p>
                              )}
                              {typeof apt.service === 'object' && apt.service?.price && (
                                <p className="text-gray-900">
                                  <span className="font-semibold">Preço:</span> R$ {(apt.service.price).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Profissional */}
                        {apt.professional && (
                          <div className="border-t pt-4">
                            <p className="text-sm font-bold text-gray-900 mb-2">Profissional</p>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-900">
                                <span className="font-semibold">Nome:</span> {apt.professional.name || 'N/A'}
                              </p>
                              {apt.professional.position && (
                                <p className="text-gray-900">
                                  <span className="font-semibold">Cargo:</span> {apt.professional.position}
                                </p>
                              )}
                              {apt.professional.email && (
                                <p className="text-gray-900">
                                  <span className="font-semibold">Email:</span> {apt.professional.email}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Status */}
                        {apt.status && (
                          <div className="border-t pt-4">
                            <p className="text-sm font-bold text-gray-900 mb-2">Status</p>
                            <p className="text-sm text-gray-700 capitalize">
                              {apt.status === 'confirmed' ? 'Confirmado' : apt.status}
                            </p>
                          </div>
                        )}

                        {/* Datas de criação e atualização */}
                        {(apt.created_at || apt.updated_at) && (
                          <div className="border-t pt-4 text-xs text-gray-600 space-y-1">
                            {apt.created_at && (
                              <p>Criado em: {format(parseISO(apt.created_at), 'dd/MM/yyyy')}</p>
                            )}
                            {apt.updated_at && (
                              <p>Atualizado em: {format(parseISO(apt.updated_at), 'dd/MM/yyyy')}</p>
                            )}
                          </div>
                        )}

                        {/* Botões Editar/Salvar */}
                        <div className="border-t pt-4">
                          {!isEditing ? (
                            <Button 
                              onClick={() => setIsEditing(true)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Editar
                            </Button>
                          ) : (
                            <div className="space-y-4">
                              {/* Edit Form */}
                              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Data</label>
                                  <input
                                    type="date"
                                    value={editData.date}
                                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Hora</label>
                                  <input
                                    type="time"
                                    value={editData.time}
                                    onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Cliente</label>
                                  <select
                                    value={editData.customer_id}
                                    onChange={(e) => setEditData({ ...editData, customer_id: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                  >
                                    <option value="">Selecione um cliente</option>
                                    {customers.map((c) => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Serviço</label>
                                  <select
                                    value={editData.service_id}
                                    onChange={(e) => setEditData({ ...editData, service_id: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                  >
                                    <option value="">Selecione um serviço</option>
                                    {services.map((s) => (
                                      <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Profissional</label>
                                  <select
                                    value={editData.professional_id}
                                    onChange={(e) => setEditData({ ...editData, professional_id: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                  >
                                    <option value="">Selecione um profissional</option>
                                    {professionals.map((p) => (
                                      <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Status</label>
                                  <select
                                    value={editData.status}
                                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                  >
                                    <option value="pending">Pendente</option>
                                    <option value="confirmed">Confirmado</option>
                                    <option value="completed">Concluído</option>
                                    <option value="cancelled">Cancelado</option>
                                  </select>
                                </div>
                              </div>
                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <Button
                                  onClick={async () => {
                                    setIsSaving(true)
                                    try {
                                      const apt = appointmentsByDate[selectedDate][selectedAppointmentIndex]
                                      const updateData: Record<string, string> = {
                                        appointment_date: editData.date,
                                        appointment_time: `${editData.time}:00`,
                                        status: editData.status
                                      }
                                      if (editData.customer_id) updateData.customer_id = editData.customer_id
                                      if (editData.service_id) updateData.service_id = editData.service_id
                                      if (editData.professional_id) updateData.professional_id = editData.professional_id
                                      
                                      const response = await fetch(`/api/clinic/appointments?id=${apt.id}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(updateData)
                                      })
                                      if (response.ok) {
                                        toast.success('Agendamento atualizado com sucesso')
                                        queryClient.invalidateQueries({ queryKey: ['appointments-month'] })
                                        setIsEditing(false)
                                        setIsDialogOpen(false)
                                      } else {
                                        toast.error('Erro ao atualizar agendamento')
                                      }
                                    } catch {
                                      toast.error('Erro ao atualizar agendamento')
                                    } finally {
                                      setIsSaving(false)
                                    }
                                  }}
                                  disabled={isSaving}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {isSaving ? 'Salvando...' : 'Salvar'}
                                </Button>
                                <Button
                                  onClick={() => setIsEditing(false)}
                                  disabled={isSaving}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum agendamento para este dia</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar este agendamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={async () => {
                if (!appointmentToDelete) return
                setIsDeleting(true)
                try {
                  await fetch(`/api/clinic/appointments?id=${appointmentToDelete}`, { method: 'DELETE' })
                  toast.success('Agendamento deletado com sucesso')
                  queryClient.invalidateQueries({ queryKey: ['appointments-month'] })
                  setDeleteDialogOpen(false)
                  setAppointmentToDelete(null)
                } catch {
                  toast.error('Erro ao deletar agendamento')
                } finally {
                  setIsDeleting(false)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
    </div>
  )
}
