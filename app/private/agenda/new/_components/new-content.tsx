'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const NewAppointmentClient = dynamic(() => import('../new-appointment-client').then((mod) => mod.default), { ssr: false })

export default function NewContent() {
  return (
    <Suspense fallback={<div className="p-4">Carregando formulário...</div>}>
      <NewAppointmentClient />
    </Suspense>
  )
}
