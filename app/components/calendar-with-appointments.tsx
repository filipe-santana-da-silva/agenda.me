'use client'

import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { format, isBefore, startOfToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, CalendarDays, User, Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'

const DayPickerComponent = dynamic(() => import('./day-picker'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-gray-500">Carregando calendário...</div>
})

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status?: string | null
  customer_id?: string | null
  service_id?: string | null
  color_index?: number
  name?: string
  eventname?: string
}

interface CalendarWithAppointmentsProps {
  selectedDate: string
  onDateSelect: (date: string) => void
  selectedTime?: string
  onTimeSelect?: (time: string) => void
}

const timeSlots = Array.from({ length: 23 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  return `${String(hour).padStart(2, '0')}:${minute}`
})

const COLORS = ['#B794F3', '#F2F27C', '#F3DD94', '#ED7E7E']

export function CalendarWithAppointments({
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
}: CalendarWithAppointmentsProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const minDate = startOfToday()
  
  // Create date object from string, handling timezone correctly
  const selectedDateObj = selectedDate ? (() => {
    const [year, month, day] = selectedDate.split('-').map(Number)
    return new Date(year, month -1, day)
  })() : undefined

  // Fetch appointments for the selected date
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return []
      const params = new URLSearchParams({ date: selectedDate })
      const url = `/api/clinic/appointments?${params.toString()}`
      const response = await fetch(url)
      const json = await response.json()
      return response.ok ? (json as Appointment[]) : []
    },
    enabled: !!selectedDate,
    staleTime: 60000,
  })

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Format the date directly using getFullYear, getMonth, getDate to avoid timezone issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      onDateSelect(dateStr)
      setShowCalendar(false)
    }
  }

  // Group appointments by time
  const appointmentsByTime = appointments.reduce((acc, apt) => {
    const time = apt.appointment_time?.substring(0, 5) || ''
    if (!acc[time]) {
      acc[time] = []
    }
    acc[time].push(apt)
    return acc
  }, {} as Record<string, Appointment[]>)

  return (
    <div className="w-full space-y-6">
      {/* Date Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Selecione a Data</h3>
        </div>

        <div className="relative">
          <Button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full h-14 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-slate-700 dark:to-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-500 border-2 border-blue-200 dark:border-slate-500 text-gray-900 dark:text-slate-100 font-medium text-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {selectedDate && selectedDateObj
              ? format(selectedDateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
              : 'Selecione uma data'}
          </Button>

          {showCalendar && (
            <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-slate-600 rounded-xl shadow-xl z-50 p-4">
              <style>
                {`
                  .rdp {
                    --rdp-cell-size: 40px;
                    --rdp-accent-color: #2563eb;
                    --rdp-background-color: #dbeafe;
                  }
                  .rdp-months {
                    margin: 0;
                  }
                  .rdp-head_cell {
                    font-weight: 600;
                    color: #1f2937;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                  }
                  .dark .rdp-head_cell {
                    color: #e2e8f0;
                  }
                  .rdp-cell {
                    padding: 0;
                  }
                  .rdp-day {
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.2s;
                    color: #1f2937;
                  }
                  .dark .rdp-day {
                    color: #e2e8f0;
                  }
                  .rdp-day_selected:not([disabled]):not(.rdp-day_outside) {
                    background-color: #2563eb;
                    color: white;
                    font-weight: 700;
                  }
                  .rdp-day_today {
                    font-weight: 700;
                    color: #2563eb;
                  }
                  .dark .rdp-day_today {
                    color: #60a5fa;
                  }
                  .rdp-day:hover:not([disabled]):not(.rdp-day_outside) {
                    background-color: #dbeafe;
                  }
                  .dark .rdp-day:hover:not([disabled]):not(.rdp-day_outside) {
                    background-color: #475569;
                  }
                  .rdp-day_disabled {
                    color: #d1d5db;
                    cursor: not-allowed;
                  }
                  .dark .rdp-day_disabled {
                    color: #64748b;
                  }
                  .rdp-caption {
                    padding: 0 0 1rem 0;
                    margin-bottom: 1rem;
                    border-bottom: 2px solid #e5e7eb;
                  }
                  .dark .rdp-caption {
                    border-bottom-color: #475569;
                  }
                  .rdp-caption_label {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #1f2937;
                  }
                  .dark .rdp-caption_label {
                    color: #e2e8f0;
                  }
                  .rdp-nav {
                    gap: 0.5rem;
                  }
                  .rdp-nav_button {
                    border-radius: 8px;
                    padding: 0.5rem;
                    background-color: #f3f4f6;
                    color: #1f2937;
                    transition: all 0.2s;
                  }
                  .dark .rdp-nav_button {
                    background-color: #64748b;
                    color: #e2e8f0;
                  }
                  .rdp-nav_button:hover {
                    background-color: #e5e7eb;
                  }
                  .dark .rdp-nav_button:hover {
                    background-color: #475569;
                  }
                `}
              </style>
              <Suspense fallback={<div className="p-4 text-center">Carregando...</div>}>
                <DayPickerComponent
                  selected={selectedDateObj}
                  onSelect={handleDateSelect}
                  minDate={minDate}
                />
              </Suspense>
            </div>
          )}
        </div>

        {selectedDate && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 rounded-lg">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-slate-100">
              Data selecionada: {(() => {
                const [year, month, day] = selectedDate.split('-').map(Number)
                return format(new Date(year, month - 1, day), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
              })()}
            </span>
          </div>
        )}
      </div>

      {/* Time Section with Appointments */}
      {selectedDate && onTimeSelect && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Selecione o Horário ({appointments.length} agendamentos)
            </h3>
          </div>

          <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto p-2 bg-gray-50 dark:bg-slate-700 rounded-xl border-2 border-gray-200 dark:border-slate-600">
            {timeSlots.map((time) => {
              const timeAppointments = appointmentsByTime[time] || []
              const hasAppointments = timeAppointments.length > 0

              return (
                <div key={time} className="space-y-2">
                  <Button
                    type="button"
                    onClick={() => onTimeSelect(time)}
                    className={`w-full h-12 font-semibold text-sm transition-all duration-200 rounded-lg ${
                      selectedTime === time
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105'
                        : hasAppointments
                          ? 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 border-2 border-red-400 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-800'
                          : 'bg-white dark:bg-slate-600 text-gray-900 dark:text-slate-100 border-2 border-gray-300 dark:border-slate-500 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-500'
                    }`}
                  >
                    {time}
                  </Button>

                  {/* Show appointment indicators */}
                  {hasAppointments && (
                    <div className="space-y-1">
                      {timeAppointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className="text-xs p-1 rounded bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 truncate border-l-2"
                          style={{
                            borderLeftColor: COLORS[apt.color_index || 0],
                          }}
                          title={apt.name || apt.eventname || 'Agendamento'}
                        >
                          {apt.name?.substring(0, 12) || apt.eventname?.substring(0, 12) || 'Apt'}
                        </div>
                      ))}
                      {timeAppointments.length > 2 && (
                        <div className="text-xs p-1 text-center text-gray-600 dark:text-slate-300 font-semibold">
                          +{timeAppointments.length - 2} mais
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {selectedTime && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-slate-700 border border-blue-200 dark:border-slate-600 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-slate-100">
                Horário selecionado: {selectedTime}
                {appointmentsByTime[selectedTime]?.length > 0 && (
                  <span className="ml-2 font-bold text-red-600">
                    ({appointmentsByTime[selectedTime].length} agendado{appointmentsByTime[selectedTime].length > 1 ? 's' : ''})
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Appointments Details Card */}
          {selectedTime && appointmentsByTime[selectedTime]?.length > 0 && (
            <Card className="border-2 border-orange-200 dark:border-orange-600 bg-orange-50 dark:bg-slate-800">
              <CardContent className="pt-6">
                <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Agendamentos em {selectedTime}
                </h4>
                <div className="space-y-3">
                  {appointmentsByTime[selectedTime].map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700 rounded-lg border-l-4"
                      style={{
                        borderLeftColor: COLORS[apt.color_index || 0],
                      }}
                    >
                      <div className="flex-shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[apt.color_index || 0] }}></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-slate-100 truncate">
                          {apt.name || apt.eventname || 'Sem nome'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-slate-300">
                          {apt.status === 'confirmed' ? '✓ Confirmado' : apt.status === 'pending' ? '⏳ Pendente' : '✗ Cancelado'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
