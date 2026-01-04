'use client'

import { useState, useEffect, useRef } from 'react'
import { Clock, Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface TimelineTimerProps {
  duration?: number // Duração em minutos (padrão: 60 minutos)
}

export function TimelineTimer({ duration = 60 }: TimelineTimerProps) {
  const [isActive, setIsActive] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const isActiveRef = useRef(false)
  const durationSeconds = duration * 60

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
    <Card className="w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
      <div className="space-y-4">
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
          <span className="text-center text-xs font-medium">Duração: {duration} min</span>
          <span>{formatTime(durationSeconds)}</span>
        </div>

        {/* Timeline bar */}
        <div className="relative h-3 bg-blue-200 rounded-full overflow-hidden shadow-inner">
          {/* Progress line */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-linear shadow-lg"
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
