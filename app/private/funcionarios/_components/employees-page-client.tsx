'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit2, Search, Users, TrendingUp, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { EmployeeDialog } from './employee-dialog'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { EmployeeViewDialog } from './employee-view-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Employee = {
  id: string
  name: string
  email: string
  phone?: string
  cpf?: string
  position: string
  department?: string
  hire_date: string
  salary?: number
  status: 'active' | 'inactive' | 'on_leave'
  address?: string
  city?: string
  state?: string
  zip_code?: string
  birth_date?: string
  emergency_contact?: string
  emergency_phone?: string
  notes?: string
  work_start?: string
  work_end?: string
  lunch_start?: string
  lunch_end?: string
  break_intervals?: string
  created_at?: string
}

export function EmployeesPageClient() {
  const supabase = createClient()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'on_leave'>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const [departments, setDepartments] = useState<string[]>([])
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      setEmployees(data || [])

      // Extract unique departments
      const depts = Array.from(
        new Set((data || []).map((e) => e.department).filter(Boolean))
      ) as string[]
      setDepartments(depts.sort())
    } catch (err: Record<string, unknown>) {
      toast.error(err.message || 'Erro ao carregar funcionários')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('employees').delete().eq('id', id)

      if (error) throw error
      toast.success('Funcionário removido com sucesso')
      setDeleteConfirm(null)
      loadEmployees()
    } catch (err: Record<string, unknown>) {
      toast.error(err.message || 'Erro ao remover funcionário')
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingEmployee(null)
  }

  const handleEmployeeSaved = () => {
    handleDialogClose()
    loadEmployees()
  }

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone?.includes(searchTerm) ||
      emp.cpf?.includes(searchTerm)

    const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus
    const matchesDepartment =
      selectedDepartment === 'all' || emp.department === selectedDepartment

    return matchesSearch && matchesStatus && matchesDepartment
  })

  // Stats calculations
  const totalEmployees = employees.length
  const activeEmployees = employees.filter((e) => e.status === 'active').length
  const onLeave = employees.filter((e) => e.status === 'on_leave').length
  const totalSalary = employees
    .filter((e) => e.salary && e.status === 'active')
    .reduce((sum, e) => sum + (e.salary || 0), 0)

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'inactive':
        return 'Inativo'
      case 'on_leave':
        return 'Licença'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-sm text-muted-foreground mt-1 sm:mt-2">Gerencie o cadastro de funcionários</p>
        </div>
        <Button
          onClick={() => {
            setEditingEmployee(null)
            setIsDialogOpen(true)
          }}
          className="gap-2 text-sm"
          size="sm"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Novo Funcionário</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              <span className="hidden sm:inline">Total de Funcionários</span>
              <span className="sm:hidden">Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{activeEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
              <span className="text-yellow-600">📋</span>
              <span className="hidden sm:inline">Em Licença</span>
              <span className="sm:hidden">Licença</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{onLeave}</div>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
              <span>💰</span>
              <span className="hidden sm:inline">Folha de Pagamento</span>
              <span className="sm:hidden">Folha</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold">R$ {totalSalary.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 sm:pl-10 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={selectedStatus} onValueChange={(value: Record<string, unknown>) => setSelectedStatus(value)}>
            <SelectTrigger className="text-xs sm:text-sm" suppressHydrationWarning>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
              <SelectItem value="on_leave">Em Licença</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDepartment} onValueChange={(value) => setSelectedDepartment(value)}>
            <SelectTrigger className="text-xs sm:text-sm" suppressHydrationWarning>
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base sm:text-lg">Funcionários</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{filteredEmployees.length} funcionário(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Carregando funcionários...</div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">
                {searchTerm ? 'Nenhum funcionário encontrado' : 'Nenhum funcionário cadastrado'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nome</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Email</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Telefone</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Cargo</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Departamento</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium text-xs">{employee.name}</TableCell>
                      <TableCell className="text-xs hidden sm:table-cell">{employee.email}</TableCell>
                      <TableCell className="text-xs hidden md:table-cell">{employee.phone || '-'}</TableCell>
                      <TableCell className="text-xs hidden lg:table-cell">{employee.position}</TableCell>
                      <TableCell className="text-xs hidden lg:table-cell">{employee.department || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusBadgeColor(employee.status)}`}>
                          {getStatusLabel(employee.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                            onClick={() => setViewingEmployee(employee)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                            onClick={() => {
                              setEditingEmployee(employee)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                            onClick={() =>
                              setDeleteConfirm({
                                id: employee.id,
                                name: employee.name,
                              })
                            }
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EmployeeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        employee={editingEmployee}
        onClose={handleDialogClose}
        onSaved={handleEmployeeSaved}
      />

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open: boolean) => !open && setDeleteConfirm(null)}
        employeeName={deleteConfirm?.name || ''}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
      />

      <EmployeeViewDialog
        open={!!viewingEmployee}
        onOpenChange={(open: boolean) => !open && setViewingEmployee(null)}
        employee={viewingEmployee}
      />
    </div>
  )
}
