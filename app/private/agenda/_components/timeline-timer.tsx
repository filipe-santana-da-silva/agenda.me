'use client'

import { useState, useEffect, useRef } from 'react'
import { Clock, Play, Pause, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Appointment {
  id: string
  appointment_date?: string
  appointment_time?: string
  service?: {
    id: string
    name: string
    duration: number
    price: number
  }
  professional?: {
    id: string
    name: string
    email?: string
    position?: string
  }
  customer?: {
    id: string
    name: string
  }
}

interface TimelineTimerProps {
  duration?: number // Duração em minutos (padrão: 60 minutos)
  appointment?: Appointment // Agendamento vinculado (usa duração do serviço)
  onRemoveAppointment?: () => void // Callback quando remover agendamento
}

export function TimelineTimer({ duration = 60, appointment, onRemoveAppointment }: TimelineTimerProps) {
  const [isActive, setIsActive] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [displayAppointment, setDisplayAppointment] = useState<Appointment | undefined>(appointment)
  const isActiveRef = useRef(false)
  
  // Atualizar agendamento exibido quando prop mudar
  useEffect(() => {
    setDisplayAppointment(appointment)
  }, [appointment])
  
  // Usar duração do serviço do agendamento se disponível, caso contrário usar o prop duration
  const getEffectiveDuration = () => {
    if (displayAppointment?.service?.duration) {
      return displayAppointment.service.duration
    }
    return duration
  }
  
  const handleRemoveAppointment = () => {
    setDisplayAppointment(undefined)
    onRemoveAppointment?.()
  }
  
  const effectiveDuration = getEffectiveDuration()
  const durationSeconds = effectiveDuration * 60


  // Sincronizar ref com estado
  useEffect(() => {
    isActiveRef.current = isActive
  }, [isActive])

  // Calcular progresso como porcentagem
  const progress = Math.min(100, (elapsedSeconds / durationSeconds) * 100)

  // Update timer a cada segundo - usar ref para evitar dependências
  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setElapsedSeconds(prev => {
        const nextValue = prev + 1
        // Parar quando atingir a duração (sem chamar setIsActive que causa re-render)
        if (nextValue >= durationSeconds) {
          return durationSeconds
        }
        return nextValue
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, durationSeconds])

  const handleStart = () => {
    setIsActive(true)
  }

  const handlePause = () => {
    setIsActive(false)
  }

  const handleReset = () => {
    setIsActive(false)
    setElapsedSeconds(0)
  }

  // Converter segundos para formato HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Calcular tempo restante
  const remainingSeconds = durationSeconds - elapsedSeconds
  const remainingMinutes = Math.floor(remainingSeconds / 60)

  return (
    <Card className="w-full p-4 bg-linear-to-r from-blue-50 to-blue-100 border-blue-200">
      <div className="space-y-4">
        {/* Appointment Info - se houver agendamento vinculado */}
        {displayAppointment && (
          <div className="bg-white rounded-lg p-3 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Agendamento Vinculado</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveAppointment}
                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                title="Remover agendamento"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              {displayAppointment.service && (
                <div>
                  <p className="text-gray-600 font-medium">Serviço</p>
                  <p className="text-gray-900 font-semibold">{displayAppointment.service.name}</p>
                </div>
              )}
              
              {displayAppointment.professional && (
                <div>
                  <p className="text-gray-600 font-medium">Profissional</p>
                  <p className="text-gray-900 font-semibold">{displayAppointment.professional.name}</p>
                </div>
              )}
              
              {displayAppointment.customer && (
                <div className="col-span-2">
                  <p className="text-gray-600 font-medium">Cliente</p>
                  <p className="text-gray-900 font-semibold">{displayAppointment.customer.name}</p>
                </div>
              )}

              {displayAppointment.appointment_date && displayAppointment.appointment_time && (
                <div className="col-span-2">
                  <p className="text-gray-600 font-medium">Data e Hora</p>
                  <p className="text-gray-900 font-semibold">
                    {displayAppointment.appointment_date} às {displayAppointment.appointment_time}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header com controles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Cronômetro</span>
          </div>
          <div className="text-lg font-bold text-blue-900 font-mono">{formatTime(elapsedSeconds)}</div>
        </div>

        {/* Duração info */}
        <div className="flex justify-between text-xs text-blue-700 px-1">
          <span>00:00</span>
          <span className="text-center text-xs font-medium">Duração: {effectiveDuration} min</span>
          <span>{formatTime(durationSeconds)}</span>
        </div>

        {/* Timeline bar */}
        <div className="relative h-3 bg-blue-200 rounded-full overflow-hidden shadow-inner">
          {/* Progress line */}
          <div
            className="absolute top-0 left-0 h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-linear shadow-lg"
            style={{ width: `${progress}%` }}
          />
          {/* Indicator dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-600 rounded-full shadow-md transition-all duration-300 ease-linear border-2 border-white"
            style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        {/* Progress percentage e tempo restante */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-blue-700 font-medium">
            {Math.round(progress)}% • Restam {remainingMinutes} min
          </span>
          
          {/* Control buttons */}
          <div className="flex gap-2">
            {!isActive ? (
              <Button
                size="sm"
                onClick={handleStart}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
              >
                <Play className="w-3 h-3" />
                <span className="hidden sm:inline">Iniciar</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handlePause}
                variant="outline"
                className="border-blue-400 text-blue-600 hover:bg-blue-50 gap-1"
              >
                <Pause className="w-3 h-3" />
                <span className="hidden sm:inline">Pausar</span>
              </Button>
            )}
            
            <Button
              size="sm"
              onClick={handleReset}
              variant="outline"
              className="border-blue-400 text-blue-600 hover:bg-blue-50 gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Resetar</span>
            </Button>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-blue-700">
              {isActive ? 'Cronômetro ativo' : 'Cronômetro parado'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
