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

      setRole('USER')
      setPaginas([])
    }

    fetchPermissoes()
  }, [supabase])

  return { role, paginas }
}
