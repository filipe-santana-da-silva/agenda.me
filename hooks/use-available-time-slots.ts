import { useEffect, useState } from 'react'

interface UseAvailableTimeSlotsProps {
  barbershopId: string | undefined
  date: string | undefined
}

export function useAvailableTimeSlots({
  barbershopId,
  date,
}: UseAvailableTimeSlotsProps) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!barbershopId || !date) {
      setAvailableTimeSlots([])
      return
    }

    const fetchAvailableTimeSlots = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/public/available-time-slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            barbershop_id: barbershopId,
            date,
          }),
        })

        if (!response.ok) {
          throw new Error('Erro ao buscar horários disponíveis')
        }

        const data = await response.json()
        setAvailableTimeSlots(data.availableTimeSlots || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        setAvailableTimeSlots([])
      } finally {
        setLoading(false)
      }
    }

    fetchAvailableTimeSlots()
  }, [barbershopId, date])

  return { availableTimeSlots, loading, error }
}
