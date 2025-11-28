'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
// no checkbox UI needed

export default function GerenciarPermissoes() {
  const supabase = createClient()

  const [roles, setRoles] = useState<{ id: number; name: string }[]>([])
  const [usuarios, setUsuarios] = useState<{ email: string; role: string | null; pages: string[]; userId?: string }[]>([])

  const [email, setEmail] = useState("")
  // store roleName for POST/PUT since admin endpoint accepts roleName
  const [roleName, setRoleName] = useState("")
  const [password, setPassword] = useState("")
  // always create an authentication account when creating a new user
  const createAuthAccount = true
  // roleName state stores selected role for RBAC
  const [editingEmail, setEditingEmail] = useState<string | null>(null)
  const [isSavingUser, setIsSavingUser] = useState(false)

  useEffect(() => {
    fetchRoles()
    fetchUsuarios()
  }, [])

  useEffect(() => {
    // no-op
  }, [])



  async function fetchRoles() {
    try {
      const { data, error } = await supabase.from('role').select('*')
      if (error) {
        console.error('fetchRoles error', error)
        return
      }
      if (data) setRoles(data)
    } catch (e) {
      console.error('fetchRoles unexpected', e)
    }
  }


  async function fetchUsuarios() {
    try {
      const res = await fetch('/api/admin/users')
      let payload: any = undefined
      try {
        payload = await res.json()
      } catch (err) {
        // fallback: maybe empty body or non-json response
        const txt = await res.text()
        payload = { error: txt || String(err) }
      }
      if (!res.ok) {
        console.error('fetchUsuarios error', payload)
        alert('Erro ao buscar usuários: ' + (payload.error || res.statusText))
        return
      }

  const data = payload.data || []
  // map pages (names) to resource ids later when editing; keep pages as names for display
  setUsuarios((data as any[]).map((u: any) => ({ email: u.email, role: Array.isArray(u.roles) && u.roles.length > 0 ? u.roles[0] : null, pages: u.pages || [], userId: u.userId })))
    } catch (e) {
      console.error('fetchUsuarios unexpected', e)
      alert('Erro inesperado ao buscar usuários')
    }
  }

  // no per-page permission toggles in RBAC-only UI

  async function salvarUsuario() {
    if (!email || !roleName) {
        alert("Por favor informe e-mail e selecione um papel.")
      return
    }

    setIsSavingUser(true)
    try {
      // prepare body common fields
      const body: any = {
        email: email.toLowerCase(),
        createAuthAccount,
        roleName: (roleName || '').toString().toUpperCase(),
      }

      if (!editingEmail) {
        // creating a new user
        if (createAuthAccount) {
          if (!password || password.length < 6) {
            alert("Para criar a conta, informe uma senha com ao menos 6 caracteres.")
            setIsSavingUser(false)
            return
          }
          body.password = password
        }

  const res = await fetch('/api/admin/users', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
        let payload: any = undefined
        try {
          payload = await res.json()
        } catch (err) {
          const txt = await res.text()
          payload = { error: txt || String(err) }
        }
        if (!res.ok) {
          console.error('salvarUsuario error', payload)
          alert('Erro salvando usuário: ' + (payload.error || res.statusText))
          return
        }
      } else {
        // updating existing user's role assignment
        const updateBody = { roleName: (roleName || '').toString().toUpperCase() }
        const res = await fetch(`/api/admin/users/${encodeURIComponent(editingEmail)}`, {
          method: 'PUT',
          body: JSON.stringify(updateBody),
          headers: { 'Content-Type': 'application/json' },
        })
        let payload: any = undefined
        try {
          payload = await res.json()
        } catch (err) {
          const txt = await res.text()
          payload = { error: txt || String(err) }
        }
        if (!res.ok) {
          console.error('salvarUsuario (update) error', payload)
          alert('Erro atualizando usuário: ' + (payload.error || res.statusText))
          return
        }
      }

      alert(editingEmail ? 'Usuário atualizado.' : 'Usuário criado com sucesso.')
  setEmail('')
  setPassword('')
  // nothing to clear for per-page permissions
      setEditingEmail(null)
      // refresh users from server
      await fetchUsuarios()
    } catch (e) {
      console.error('salvarUsuario unexpected', e)
      alert('Erro inesperado ao salvar usuário')
    } finally {
      setIsSavingUser(false)
    }
  }

  // per-role permission management removed from UI (no checkbox selection available)

  async function handleEditUser(u: { email: string; role: string | null; pages: string[]; userId?: string }) {
    // load the user's role and role permissions
    setEditingEmail(u.email)
    setEmail(u.email)
    setRoleName(u.role ?? '')
    try {
      // nothing else to load for editing besides roleName
    } catch (e) {
      console.error('handleEditUser unexpected', e)
      alert('Erro inesperado ao carregar permissões do papel do usuário')
    }
  }

  async function handleDeleteUser(emailToDelete: string) {
    if (!confirm(`Confirma remoção do usuário ${emailToDelete}?`)) return
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(emailToDelete)}`, { method: 'DELETE' })
      let payload: any = undefined
      try {
        payload = await res.json()
      } catch (err) {
        const txt = await res.text()
        payload = { error: txt || String(err) }
      }
      if (!res.ok) {
        console.error('delete user error', payload)
        alert('Erro ao deletar usuário: ' + (payload.error || res.statusText))
        return
      }
      alert('Usuário removido com sucesso')
      fetchUsuarios()
    } catch (e) {
      console.error('delete user unexpected', e)
      alert('Erro inesperado ao deletar usuário')
    }
  }

  return (
    <div className="w-full h-full px-2 py-4 sm:px-6 sm:py-8 grid grid-cols-1 gap-4">
      <Card className="p-3 sm:p-6">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-bold mb-4 text-center">Gerenciar Permissões (por Usuário)</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@email.com"
              className="w-full"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha para criar conta (min 6 caracteres)"
              className="w-full"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm block mb-1">Papel </label>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">Selecione um papel</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>{role.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
              <Button onClick={salvarUsuario} disabled={isSavingUser} className="w-full sm:w-auto">{isSavingUser ? 'Salvando...' : (editingEmail ? 'Salvar Alterações' : 'Criar Usuário')}</Button>
              {editingEmail && <Button variant="ghost" onClick={() => { setEditingEmail(null); setEmail(''); setRoleName(''); }} className="w-full sm:w-auto">Cancelar</Button>}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <h2 className="text-base sm:text-lg font-semibold mb-2 text-center">Usuários Cadastrados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 font-semibold text-sm text-muted-foreground mb-2">
              <span>E-MAIL</span>
              <span>PAPEL</span>
              <span className="hidden sm:block">AÇÕES</span>
            </div>
            {usuarios.map((u) => (
              <div key={u.email} className="grid grid-cols-2 sm:grid-cols-3 items-center py-2 border-b gap-2">
                <div className="truncate">{u.email}</div>
                <div className="text-sm text-muted-foreground">{u.role || '-'}</div>
                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button size="sm" onClick={() => handleEditUser(u)} className="w-full sm:w-auto">Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.email)} className="w-full sm:w-auto">Excluir</Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
