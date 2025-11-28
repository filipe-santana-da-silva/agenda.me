'use client'

import dynamic from 'next/dynamic'

const Appointment = dynamic(() => import('../appointments/appointment').then(mod => mod.Appointment), {
  ssr: false,
  loading: () => <div className="p-4 text-muted-foreground">Carregando agendamentos...</div>
})

interface AgendaContentProps {
  userId: string
  reminders: React.ReactNode
}

export function AgendaContent({ userId, reminders }: AgendaContentProps) {
  return (
    <div className="space-y-6">
      <Appointment userId={userId} />
      {reminders}
    </div>
  )
}
