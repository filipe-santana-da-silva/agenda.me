'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'
import { getReminders } from './_data-access/get-reminder'

type ReminderItem = {
  id: string
  description: string
  userId?: string | null
  createdat?: string | null
}

// Lazy load components
const CalendarViewWithAppointments = dynamic(
  () => import('@/app/components/calendar-view-appointments').then(mod => mod.CalendarViewWithAppointments),
  {
    ssr: false,
    loading: () => (
      <Card className="w-full dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground dark:text-slate-300">Carregando calendário...</p>
        </CardContent>
      </Card>
    ),
  }
)

const ReminderListLazy = dynamic(
  () => import('./reminder/reminder-content').then(mod => ({ default: mod.ReminderList })),
  {
    ssr: false,
    loading: () => (
      <Card className="w-full dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-muted border-t-blue-600 rounded-full animate-spin" />
          <p className="text-muted-foreground dark:text-slate-300">Carregando lembretes...</p>
        </CardContent>
      </Card>
    ),
  }
)

export default function Agenda() {
  const [reminders, setReminders] = useState<ReminderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReminders()
  }, [])

  async function loadReminders() {
    try {
      setLoading(true)
      const data = await getReminders({ userId: '1' })
      setReminders(data || [])
    } catch (err) {
      console.error('Erro ao carregar lembretes:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={
        <Card className="w-full dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground dark:text-slate-300">Carregando calendário...</p>
          </CardContent>
        </Card>
      }>
        <CalendarViewWithAppointments />
      </Suspense>

      <Suspense fallback={
        <Card className="w-full dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-muted border-t-blue-600 rounded-full animate-spin" />
            <p className="text-muted-foreground dark:text-slate-300">Carregando lembretes...</p>
          </CardContent>
        </Card>
      }>
        {!loading && <ReminderListLazy reminder={reminders} onRefresh={loadReminders} />}
      </Suspense>
    </div>
  )
}
