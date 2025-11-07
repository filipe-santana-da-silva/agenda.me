'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export default function GerenciarPermissoes() {
  const supabase = createClient()

  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])
  const [paginas, setPaginas] = useState<{ id: string; name: string }[]>([])
  const [usuarios, setUsuarios] = useState<{ email: string; role: string }[]>([])

  const [email, setEmail] = useState("")
  const [roleId, setRoleId] = useState("")
  const [permissoes, setPermissoes] = useState<string[]>([])

  useEffect(() => {
    fetchRoles()
    fetchPaginas()
    fetchUsuarios()
  }, [])

  useEffect(() => {
    if (roleId) fetchPermissoesDoRole(roleId)
  }, [roleId])

  async function fetchRoles() {
    const { data } = await supabase.from("role").select("*")
    if (data) setRoles(data)
  }

  async function fetchPaginas() {
    const { data } = await supabase.from("page").select("*")
    if (data) setPaginas(data)
  }

  async function fetchUsuarios() {
    const { data } = await supabase
      .from("user_permission")
      .select("email, role:role_id(name)")
    if (data) {
      const formatado = data.map((u: any) => ({
        email: u.email,
        role: u.role?.name ?? "—",
      }))
      setUsuarios(formatado)
    }
  }

  async function fetchPermissoesDoRole(roleId: string) {
    const { data } = await supabase
      .from("permission")
      .select("page_id")
      .eq("role_id", roleId)
      .eq("can_view", true)

    if (data) {
      const permitidas = data.map((p: any) => p.page_id)
      setPermissoes(permitidas)
    }
  }

  function togglePermissao(pageId: string) {
    if (permissoes.includes(pageId)) {
      setPermissoes(permissoes.filter((id) => id !== pageId))
    } else {
      setPermissoes([...permissoes, pageId])
    }
  }

  async function salvarUsuario() {
    if (!email || !roleId) return

    await supabase.from("user_permission").upsert({
      email,
      role_id: roleId,
    })

    setEmail("")
    setRoleId("")
    setPermissoes([])
    fetchUsuarios()
  }

  async function salvarPermissoes() {
    if (!roleId) return

    await supabase.from("permission").delete().eq("role_id", roleId)

    const novasPermissoes = permissoes.map((pageId) => ({
      role_id: roleId,
      page_id: pageId,
      can_view: true,
    }))

    await supabase.from("permission").insert(novasPermissoes)
    alert("Permissões atualizadas com sucesso!")
  }

  return (
    <div className="w-full h-full p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Usuários por papel */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold mb-4">Usuários por Papel</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@email.com"
            />
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">Selecione um papel</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={salvarUsuario}>Salvar Usuário</Button>
        </CardHeader>

        <CardContent>
          <h2 className="text-lg font-semibold mb-2">Usuários Cadastrados</h2>
          <div className="grid grid-cols-2 font-semibold text-sm text-muted-foreground mb-2">
            <span>E-MAIL</span>
            <span>PAPEL</span>
          </div>
          {usuarios.map((u, index) => (
            <div key={index} className="grid grid-cols-2 items-center py-2 border-b">
              <span>{u.email}</span>
              <span>{u.role}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Permissões por papel */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold mb-4">Permissões por Papel</CardTitle>
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-sm font-medium">Selecione um papel:</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent>
          {roleId && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Páginas Permitidas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {paginas.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={permissoes.includes(p.id)}
                      onCheckedChange={() => togglePermissao(p.id)}
                    />
                    <label className="text-sm font-medium">{p.name}</label>
                  </div>
                ))}
              </div>
              <Button onClick={salvarPermissoes} className="mt-6">
                Salvar Permissões
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
