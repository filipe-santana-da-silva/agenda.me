"use client"

import { usePermissions } from '@/utils/hooks/usePermissions'
import { PagePermission } from '@/types/permissions'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface PermissionGuardProps {
  children: React.ReactNode
  requiredPermission: PagePermission
  fallbackPath?: string
}

export function PermissionGuard({ 
  children, 
  requiredPermission, 
  fallbackPath = '/private/agenda' 
}: PermissionGuardProps) {
  const { hasPermission, user } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (user && !hasPermission(requiredPermission)) {
      router.push(fallbackPath)
    }
  }, [user, hasPermission, requiredPermission, fallbackPath, router])

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hasPermission(requiredPermission)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-6xl">🔒</div>
        <h2 className="text-xl font-semibold text-gray-900">Acesso Negado</h2>
        <p className="text-gray-600 text-center">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    )
  }

  return <>{children}</>
}