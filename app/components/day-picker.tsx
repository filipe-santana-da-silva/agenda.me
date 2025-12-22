'use client'

import { DayPicker } from 'react-day-picker'
import { isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'

interface DayPickerComponentProps {
  selected?: Date
  onSelect: (date: Date | undefined) => void
  minDate: Date
}

export default function DayPickerComponent({ selected, onSelect, minDate }: DayPickerComponentProps) {
  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      disabled={(date) => isBefore(date, minDate)}
      locale={ptBR}
      showOutsideDays={true}
      modifiers={{
        today: minDate,
      }}
    />
  )
}
