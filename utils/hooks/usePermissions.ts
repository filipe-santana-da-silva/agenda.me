import { useAuth } from '@/contexts/SimpleAuthContext'
import { UserRole, ROLE_PERMISSIONS, PagePermission } from '@/types/permissions'

export function usePermissions() {
  const { user } = useAuth()

  const hasPermission = (page: PagePermission): boolean => {
    if (!user) return false
    
    const userRole = user.role as UserRole
    
    // Se não tem role definido, permitir acesso a todas as páginas (fallback)
    if (!userRole) {
      console.log('Role não definido, permitindo acesso')
      return true
    }

    const allowedPages = ROLE_PERMISSIONS[userRole] || []
    return allowedPages.includes(page)
  }

  const isAdmin = (): boolean => {
    if (!user) return false
    return user.role === 'ADMIN'
  }

  const getUserRole = (): UserRole | null => {
    if (!user) return null
    return (user.role as UserRole) || null
  }

  return {
    hasPermission,
    isAdmin,
    getUserRole,
    user
  }
}