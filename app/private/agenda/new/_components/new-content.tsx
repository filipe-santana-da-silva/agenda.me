'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

const NewAppointmentClient = dynamic(() => import('../new-appointment-client').then((mod) => mod.NewAppointmentClient), { 
  ssr: false,
  loading: () => (
    <Card className="w-full">
      <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground">Carregando formulário...</p>
      </CardContent>
    </Card>
  )
})

export default function NewContent() {
  return (
    <Suspense fallback={
      <Card className="w-full">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando formulário...</p>
        </CardContent>
      </Card>
    }>
      <NewAppointmentClient />
    </Suspense>
  )
}
