'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function OnboardingClient() {
  const router = useRouter()

  useEffect(() => {
    localStorage.setItem('onboarding_completed', 'true')
    localStorage.removeItem('tour_completed')
    toast.success('Bem-vindo! O tour guiado irá começar.')
    router.push('/private/agenda')
  }, [router])

  return null
}
