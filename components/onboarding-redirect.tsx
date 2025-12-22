'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function OnboardingRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboarding_completed')
    const userId = localStorage.getItem('userId')

    if (userId && !onboardingCompleted && pathname !== '/private/onboarding') {
      router.push('/private/onboarding')
    }
  }, [pathname, router])

  return null
}
