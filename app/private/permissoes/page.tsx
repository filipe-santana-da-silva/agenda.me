"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, UserPlus, Eye, EyeOff, Shield, Users, Copy, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { User, UserRole, ROLE_LABELS, ROLE_PERMISSIONS } from "@/types/permissions"

export default function PermissoesPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "FUNCIONARIO" as UserRole
  })

  const generateNumericPassword = () => {
    const password = Math.floor(100000 + Math.random() * 900000).toString()
    setNewUser({ ...newUser, password })
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Preencha todos os campos")
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        toast.success("Usuário criado com sucesso")
        setIsCreateDialogOpen(false)
        setNewUser({ name: "", email: "", password: "", role: "FUNCIONARIO" })
        loadUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || "Erro ao criar usuário")
      }
    } catch (error) {
      toast.error("Erro ao criar usuário")
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      })

      if (response.ok) {
        toast.success(`Usuário ${!isActive ? 'ativado' : 'desativado'} com sucesso`)
        loadUsers()
      }
    } catch (error) {
      toast.error("Erro ao alterar status do usuário")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success("Usuário excluído com sucesso")
        loadUsers()
      }
    } catch (error) {
      toast.error("Erro ao excluir usuário")
    }
  }

  const togglePasswordVisibility = (userId: string) => {
    const newVisible = new Set(visiblePasswords)
    if (newVisible.has(userId)) {
      newVisible.delete(userId)
    } else {
      newVisible.add(userId)
    }
    setVisiblePasswords(newVisible)
  }

  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password)
    toast.success("Senha copiada!")
  }

  const regeneratePassword = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/regenerate-password`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Nova senha gerada: ${data.newPassword}`)
        loadUsers()
      }
    } catch (error) {
      toast.error("Erro ao regenerar senha")
    }
  }

  const getRolePermissions = (role: UserRole) => {
    return ROLE_PERMISSIONS[role] || []
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Permissões</h1>
          <p className="text-sm text-gray-600">Gerencie usuários e permissões</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Adicione um novo usuário ao sistema com as permissões apropriadas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha (6 dígitos)</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    value={newUser.password}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setNewUser({ ...newUser, password: value })
                    }}
                    placeholder="123456"
                    maxLength={6}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateNumericPassword}
                    className="whitespace-nowrap"
                  >
                    Gerar
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="role">Papel</Label>
                <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FUNCIONARIO">Funcionário</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser}>
                Criar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-4 h-4 text-blue-600" />
              Administrador
            </CardTitle>
            <CardDescription className="text-xs">
              Acesso completo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-1">
              {getRolePermissions("ADMIN").map((permission) => (
                <Badge key={permission} variant="default" className="text-[10px] px-1.5 py-0.5">
                  {permission}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4 text-green-600" />
              Funcionário
            </CardTitle>
            <CardDescription className="text-xs">
              Acesso limitado
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-1">
              {getRolePermissions("FUNCIONARIO").map((permission) => (
                <Badge key={permission} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                  {permission}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">Usuários</CardTitle>
          <CardDescription className="text-xs">
            Lista de usuários cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nome</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Email</TableHead>
                  <TableHead className="text-xs">Senha</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Papel</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Status</TableHead>
                  <TableHead className="text-xs hidden xl:table-cell">Criado</TableHead>
                  <TableHead className="text-xs text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-xs">
                      <div className="max-w-[100px] truncate">{user.name}</div>
                      <div className="sm:hidden text-[10px] text-gray-500">{user.email}</div>
                    </TableCell>
                    <TableCell className="text-xs hidden sm:table-cell">
                      <div className="max-w-[150px] truncate">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <span className="font-mono text-[10px] w-10">
                          {visiblePasswords.has(user.id) 
                            ? user.password_plain || '******'
                            : '******'
                          }
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="h-6 w-6 sm:h-7 sm:w-7 shrink-0"
                        >
                          {visiblePasswords.has(user.id) ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                        {user.password_plain && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyPassword(user.password_plain!)}
                            className="h-6 w-6 sm:h-7 sm:w-7 shrink-0 hidden sm:inline-flex"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => regeneratePassword(user.id)}
                          className="h-6 w-6 sm:h-7 sm:w-7 shrink-0 hidden sm:inline-flex"
                          title="Regenerar senha"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0.5">
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={user.is_active ? "default" : "destructive"} className="text-[10px] px-1.5 py-0.5">
                        {user.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs hidden xl:table-cell">
                      {new Date(user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 sm:h-7 sm:w-7 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}