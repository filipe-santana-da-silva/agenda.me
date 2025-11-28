'use client'

import { useState, useMemo } from 'react'
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Eye, Palette, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ptBR } from 'date-fns/locale'

interface CalendarWeekProps {
  appointments: Array<{
    id: string
    appointmentdate: string
    time: string
    durationhours?: number
    contractorname: string
    phone: string
    eventname?: string | null
    color_index?: number | null
    service?: { duration: number }
  }>
  onDateSelect: (date: string) => void
  selectedDate: string
  onAppointmentClick: (appointmentId: string) => void
  onColorChange: (appointmentId: string) => void
  onDelete: (appointmentId: string) => void
  loadingColors?: Set<string>
}

const COLORS = ['#B794F3', '#F2F27C', '#F3DD94', '#ED7E7E']
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = String(i).padStart(2, '0')
  return [`${hour}:00`, `${hour}:30`]
}).flat()

export function CalendarWeek({
  appointments,
  onDateSelect,
  selectedDate,
  onAppointmentClick,
  onColorChange,
  onDelete,
  loadingColors = new Set(),
}: CalendarWeekProps) {
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(selectedDate || new Date()), { weekStartsOn: 0 })
  )

  const [selectedDayForDetail, setSelectedDayForDetail] = useState<string | null>(null)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Map appointments by date and time slot
  const appointmentsByTimeSlot = useMemo(() => {
    const map: Record<string, typeof appointments> = {}

    appointments.forEach((apt) => {
      const date = apt.appointmentdate
      const time = (apt.time || '').slice(0, 5)
      const duration = apt.durationhours || (apt.service?.duration ? apt.service.duration / 60 : 1)

      const slotIndex = TIME_SLOTS.findIndex((slot) => slot === time)
      if (slotIndex !== -1) {
        const slotsNeeded = Math.max(1, Math.ceil(duration * 2))
        for (let i = 0; i < slotsNeeded; i++) {
          const slot = TIME_SLOTS[slotIndex + i]
          if (slot) {
            const key = `${date}-${slot}`
            if (!map[key]) map[key] = []
            if (!map[key].find((a) => a.id === apt.id)) {
              map[key].push(apt)
            }
          }
        }
      }
    })

    return map
  }, [appointments])

  // Map appointments by date for mobile stacked view
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, typeof appointments> = {}
    appointments.forEach((apt) => {
      const date = apt.appointmentdate
      if (!map[date]) map[date] = []
      map[date].push(apt)
    })
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    })
    return map
  }, [appointments])

  const handlePrevWeek = () => setWeekStart(addDays(weekStart, -7))
  const handleNextWeek = () => setWeekStart(addDays(weekStart, 7))

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="w-full max-w-full flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="truncate text-lg">Semana de {format(weekStart, "dd 'de' MMMM", { locale: ptBR })}</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="h-9 w-9">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))}
                className="px-2 py-1 text-xs sm:px-3 sm:text-sm whitespace-nowrap flex-1 sm:flex-none"
              >
                Hoje
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextWeek} className="h-9 w-9">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-hidden flex-1 flex flex-col">
          {/* Desktop / sm+ horizontal timeline */}
          <div className="hidden sm:flex sm:flex-col flex-1">
            <ScrollArea className="flex-1 w-full">
              <div className="flex flex-col w-full h-full">
                {/* Day headers */}
                <div className="flex border-b">
                  <div className="w-12 sm:w-20 shrink-0 border-r p-2 text-xs font-semibold" />
                  {weekDays.map((day, idx) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const isSelected = isSameDay(day, new Date(selectedDate))
                    return (
                      <button
                        key={idx}
                        onClick={() => onDateSelect(dateStr)}
                        className={`
                          flex-1 min-w-[90px] sm:min-w-[140px] p-2 text-center border-r last:border-r-0 transition-colors
                          ${isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-muted/50'}
                        `}
                      >
                        <div className="text-xs font-semibold text-muted-foreground">
                          {format(day, 'EEE', { locale: ptBR }).toUpperCase()}
                        </div>
                        <div className={`text-lg font-bold ${isSelected ? 'text-blue-600' : ''}`}>
                          {format(day, 'd')}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Time slots grid */}
                <div className="flex-1 relative">
                  {TIME_SLOTS.map((slot, slotIdx) => (
                    <div key={slot} className="flex border-b text-xs">
                      <div className="w-12 sm:w-20 shrink-0 border-r p-2 font-semibold text-muted-foreground bg-muted/20">
                        {slot}
                      </div>
                      {weekDays.map((day, dayIdx) => {
                        const dateStr = format(day, 'yyyy-MM-dd')
                        const key = `${dateStr}-${slot}`
                        const dayAppointments = appointmentsByTimeSlot[key] || []

                        return (
                          <div
                            key={`${dayIdx}-${slotIdx}`}
                            className="flex-1 min-w-[90px] sm:min-w-[140px] border-r last:border-r-0 p-1 min-h-10 bg-white hover:bg-muted/30 transition-colors relative"
                          >
                            {dayAppointments.map((apt) => {
                              const isFirst = (apt.time || '').slice(0, 5) === slot
                              if (!isFirst) return null

                              return (
                                <div
                                  key={apt.id}
                                  onClick={() => onAppointmentClick(apt.id)}
                                  className="w-full text-white text-xs rounded p-1.5 mb-1 cursor-pointer hover:shadow-md hover:opacity-90 transition-all text-left group relative"
                                  style={{
                                    backgroundColor: COLORS[apt.color_index || 0],
                                  }}
                                >
                                  <div className="font-semibold truncate">{apt.contractorname}</div>
                                  <div className="text-xs opacity-90 truncate">{apt.phone}</div>
                                  {apt.eventname && <div className="text-xs opacity-75 truncate">{apt.eventname}</div>}
                                  <div className="flex gap-1 mt-1 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded p-0.5">
                                    <button
                                      type="button"
                                      className="h-5 w-5 text-white hover:bg-white/20 rounded p-0.5"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onAppointmentClick(apt.id)
                                      }}
                                      title="Ver detalhes"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={loadingColors.has(apt.id)}
                                      className="h-5 w-5 text-white hover:bg-white/20 rounded p-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onColorChange(apt.id)
                                      }}
                                      title="Mudar cor"
                                    >
                                      {loadingColors.has(apt.id) ? (
                                        <div className="w-3 h-3 border border-white rounded-full animate-spin" />
                                      ) : (
                                        <Palette className="w-3 h-3" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      className="h-5 w-5 text-white hover:bg-white/20 rounded p-0.5"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete(apt.id)
                                      }}
                                      title="Deletar"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Mobile stacked view - click day to see details */}
          <div className="block sm:hidden">
            <div className="space-y-3">
              {weekDays.map((day, idx) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const dayAppointments = appointmentsByDate[dateStr] || []
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDayForDetail(dateStr)}
                    className="p-2 bg-white rounded border cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-semibold">{format(day, 'EEE d', { locale: ptBR })}</div>
                        <div className="text-xs text-muted-foreground">{format(day, 'MMMM yyyy', { locale: ptBR })}</div>
                      </div>
                      <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile Day Detail View */}
          {selectedDayForDetail && (
            <div className="block sm:hidden">
              <div className="space-y-0">
                <Card className="w-full max-w-full flex-1 flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="truncate text-lg">
                        {format(new Date(selectedDayForDetail), "EEEE, d 'de' MMMM", { locale: ptBR })}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedDayForDetail(null)}
                        className="h-9 w-9"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-x-hidden flex-1 flex flex-col">
                    <div className="space-y-2">
                      {(appointmentsByDate[selectedDayForDetail] || []).length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8">Nenhum agendamento</div>
                      ) : (
                        (appointmentsByDate[selectedDayForDetail] || []).map((apt) => (
                          <div
                            key={apt.id}
                            className="p-3 rounded border-l-4 bg-muted/30"
                            style={{ borderLeftColor: COLORS[apt.color_index || 0] }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-semibold text-sm">{apt.contractorname}</div>
                                <div className="text-xs text-muted-foreground">{(apt.time || '').slice(0, 5)}</div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  className="h-8 w-8 p-1.5 rounded hover:bg-white transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onAppointmentClick(apt.id)
                                  }}
                                  title="Ver detalhes"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={loadingColors.has(apt.id)}
                                  className="h-8 w-8 p-1.5 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onColorChange(apt.id)
                                  }}
                                  title="Mudar cor"
                                >
                                  {loadingColors.has(apt.id) ? (
                                    <div className="w-4 h-4 border-2 border-current rounded-full animate-spin" />
                                  ) : (
                                    <Palette className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="h-8 w-8 p-1.5 rounded hover:bg-white transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(apt.id)
                                  }}
                                  title="Deletar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {apt.phone && (
                              <div className="text-xs text-muted-foreground">{apt.phone}</div>
                            )}
                            {apt.eventname && (
                              <div className="text-xs text-muted-foreground">{apt.eventname}</div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CalendarWeek
