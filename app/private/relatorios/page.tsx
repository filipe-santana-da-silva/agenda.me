'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ReportsPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/private/financeiro')
  }, [router])

  return null
}
