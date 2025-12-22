'use client'

import React, { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { format, isBefore, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DayPickerComponent = dynamic(() => import('./day-picker'), { 
  ssr: false,
  loading: () => <div className="p-4 text-center text-gray-500">Carregando calendário...</div>
})

interface AppointmentCalendarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
  selectedTime?: string
  onTimeSelect?: (time: string) => void
  minDate?: Date
}

const timeSlots = Array.from({ length: 23 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  return `${String(hour).padStart(2, '0')}:${minute}`
})

export function AppointmentCalendar({
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  minDate = startOfToday(),
}: AppointmentCalendarProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const selectedDateObj = selectedDate ? new Date(selectedDate) : undefined

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(format(date, 'yyyy-MM-dd'))
      setShowCalendar(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Date Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Selecione a Data</h3>
        </div>

        <div className="relative">
          <Button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full h-14 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 text-gray-900 font-medium text-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {selectedDate
              ? format(new Date(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
              : 'Selecione uma data'}
          </Button>

          {showCalendar && (
            <div className="absolute top-full left-0 mt-2 bg-white border-2 border-blue-200 rounded-xl shadow-xl z-50 p-4">
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
                  .rdp-cell {
                    padding: 0;
                  }
                  .rdp-day {
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.2s;
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
                  .rdp-day:hover:not([disabled]):not(.rdp-day_outside) {
                    background-color: #dbeafe;
                  }
                  .rdp-day_disabled {
                    color: #d1d5db;
                    cursor: not-allowed;
                  }
                  .rdp-caption {
                    padding: 0 0 1rem 0;
                    margin-bottom: 1rem;
                    border-bottom: 2px solid #e5e7eb;
                  }
                  .rdp-caption_label {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #1f2937;
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
                  .rdp-nav_button:hover {
                    background-color: #e5e7eb;
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
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Data selecionada: {format(new Date(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        )}
      </div>

      {/* Time Section */}
      {selectedDate && onTimeSelect && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Selecione o Horário</h3>
          </div>

          <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-xl border-2 border-gray-200">
            {timeSlots.map((time) => (
              <Button
                key={time}
                type="button"
                onClick={() => onTimeSelect(time)}
                className={`h-12 font-semibold text-sm transition-all duration-200 rounded-lg ${
                  selectedTime === time
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-900 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {time}
              </Button>
            ))}
          </div>

          {selectedTime && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Horário selecionado: {selectedTime}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
