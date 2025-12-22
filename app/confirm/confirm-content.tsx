'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function ConfirmPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Pegar os parâmetros de query
    const barbershopId = searchParams.get('barbershopId')
    const serviceId = searchParams.get('serviceId')

    // Redirecionar para a página de booking com os parâmetros
    if (barbershopId && serviceId) {
      router.push(`/booking?barbershopId=${barbershopId}&serviceId=${serviceId}`)
    } else {
      router.push('/booking')
    }
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirecionando...</p>
    </div>
  )
}
