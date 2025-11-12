"use client"

import { useEffect, useState } from 'react'
import { AppointmentsList } from './appointment-list'

export function Appointment({ userId } : {userId: string}){
    const [times, setTimes] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        async function fetchTimes() {
            try {
                const res = await fetch(`/api/clinic/times?userId=${encodeURIComponent(userId)}`)
                if (!res.ok) {
                    console.error('Failed to fetch times', await res.text())
                    if (mounted) setTimes([])
                    return
                }
                const json = await res.json()
                if (mounted) setTimes(Array.isArray(json.times) ? json.times : json.times || [])
            } catch (e) {
                console.error('Error fetching times', e)
                if (mounted) setTimes([])
            } finally {
                if (mounted) setLoading(false)
            }
        }
        fetchTimes()
        return () => { mounted = false }
    }, [userId])

    if (loading) return <p>Carregando horários...</p>

    return <AppointmentsList times={times} />
}