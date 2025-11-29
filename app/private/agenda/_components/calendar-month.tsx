'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CalendarMonthProps {
  appointments: Array<{
    id: string
    appointmentdate: string
    time: string
    contractorname: string
    phone: string
    color_index?: number | null
  }>
  onDateSelect: (date: string) => void
  onAppointmentClick?: (appointmentId: string) => void
  selectedDate: string
  onViewChange?: (view: 'month' | 'week' | 'day') => void
}

const COLORS = ['#B794F3', '#F2F27C', '#F3DD94', '#ED7E7E']
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

export function CalendarMonth({
  appointments,
  onDateSelect,
  onAppointmentClick,
  selectedDate,
  onViewChange,
}: CalendarMonthProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()))

  // Sync currentMonth with selectedDate only when selectedDate comes from parent prop change
  // This allows local navigation with arrows without affecting parent state
  useEffect(() => {
    try {
      const newDate = parseISO(selectedDate)
      // Only update if the month actually changed from parent
      if (format(currentMonth, 'yyyy-MM') !== format(newDate, 'yyyy-MM')) {
        setCurrentMonth(newDate)
      }
    } catch (e) {
      // If selectedDate is invalid, keep currentMonth as is
    }
  }, [selectedDate])

  // Get all days to display (including previous/next month days)
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  // Map appointments by date
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, typeof appointments> = {}
    appointments.forEach((apt) => {
      const date = apt.appointmentdate
      if (!map[date]) map[date] = []
      map[date].push(apt)
    })
    return map
  }, [appointments])

  const handlePrevMonth = () => {
    const prevMonth = subMonths(currentMonth, 1)
    setCurrentMonth(prevMonth)
  }

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1)
    setCurrentMonth(nextMonth)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="w-full max-w-full flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <CardTitle className="truncate">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentMonth(new Date())}
                className="px-2 py-1 text-xs sm:px-3 sm:text-sm whitespace-nowrap flex items-center gap-2"
              >
                <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Hoje</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-hidden flex-1">
          {/* Weekday headers (hidden on xs) */}
          <div className="hidden sm:grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-muted-foreground h-8 flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid: stacked on xs (1 column), normal 7-col on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-1 bg-muted/30 p-1 rounded-lg">
            {days.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = isSameDay(day, new Date(selectedDate))
              const dayAppointments = appointmentsByDate[dateStr] || []

              return (
                <div
                  key={idx}
                  onClick={() => onDateSelect(dateStr)}
                  className={`
                    min-h-[72px] sm:min-h-14 w-full p-2 rounded border transition-all text-left text-xs cursor-pointer flex flex-col
                    ${isCurrentMonth ? 'bg-white' : 'bg-muted/40 text-muted-foreground'}
                    ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-border'}
                    hover:border-primary hover:shadow-sm
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-sm">{format(day, 'd')}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">{format(day, 'EEE', { locale: ptBR }).toUpperCase()}</div>
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayAppointments.slice(0, 3).map((apt) => (
                      <button
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onAppointmentClick?.(apt.id)
                        }}
                        className="w-full px-2 py-1 rounded text-white truncate text-xs font-medium hover:opacity-80 transition-opacity text-left"
                        style={{
                          backgroundColor: COLORS[apt.color_index || 0],
                        }}
                        title={`${apt.time} - ${apt.contractorname}`}
                      >
                        {apt.time.slice(0, 5)} {apt.contractorname.substring(0, 8)}
                      </button>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground font-medium px-1.5">
                        +{dayAppointments.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CalendarMonth
