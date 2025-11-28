'use client'

import { AgendaContentWrapper } from './_components/agenda-wrapper'
import { ReminderList } from './reminder/reminder-content'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Agenda() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reminders, setReminders] = useState<any[]>([])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error('Erro ao buscar usuário:', error.message)
        }

        const currentUserId = user?.id ?? null
        setUserId(currentUserId)

        // Fetch reminders if user exists
        if (currentUserId) {
          try {
            const { data, error: remindersError } = await supabase
              .from('Reminder')
              .select('*')
              .eq('userid', currentUserId)
              .order('reminderdate', { ascending: true })

            if (!remindersError) {
              setReminders(data || [])
            }
          } catch (err) {
            console.error('Error fetching reminders:', err)
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (isLoading) {
    return <p>Carregando...</p>
  }

  if (!userId) {
    return <p>Usuário não autenticado.</p>
  }

  return (
    <div className="space-y-6">
      <AgendaContentWrapper />
      <ReminderList reminder={reminders} />
    </div>
  )
}
