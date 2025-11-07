'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function usePermissoes() {
  const supabase = createClient()
  const [role, setRole] = useState<string | null>(null)
  const [paginas, setPaginas] = useState<string[]>([])

  useEffect(() => {
    async function fetchPermissoes() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user?.email) {
        console.error('Erro ao obter usuário:', userError?.message)
        return
      }

      // Consulta ao papel do usuário (tratando role como array)
      const { data: papel, error: papelError } = await supabase
        .from('user_permission')
        .select('role:role_id(name, id)')
        .eq('email', user.email.toLowerCase())
        .single()

      if (papelError || !papel?.role || !Array.isArray(papel.role)) {
        console.error('Erro ao buscar papel:', papelError?.message)
        return
      }

      const roleName = papel.role[0]?.name
      const roleId = papel.role[0]?.id
      setRole(roleName)

      if (!roleId) return

      // Consulta às permissões do papel
      const { data: permissoes, error: permError } = await supabase
        .from('permission')
        .select('page:page_id(name)')
        .eq('role_id', roleId)
        .eq('can_view', true)

      if (permError) {
        console.error('Erro ao buscar permissões:', permError.message)
        return
      }

      const paginasPermitidas = permissoes?.map((p: any) => p.page.name) || []
      setPaginas(paginasPermitidas)
    }

    fetchPermissoes()
  }, [])

  return { role, paginas }
}
