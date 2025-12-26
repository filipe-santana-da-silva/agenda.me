'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Filter, CheckCircle, Clock, DollarSign, FileBarChart } from 'lucide-react'
import { toast } from 'sonner'

interface Commission {
  id: string
  professional_id: string
  appointment_id: string
  transaction_id: string | null
  service_name: string
  customer_name: string
  service_price: number
  commission_rate: number
  commission_amount: number
  commission_period: string
  status: 'pending' | 'paid' | 'cancelled'
  paid_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  employees?: {
    id: string
    name: string
    email: string
    position: string
    department: string
  }
  appointments?: {
    id: string
    appointment_date: string
    appointment_time: string
  }
}

interface Summary {
  totalCommissions: number
  paidCommissions: number
  pendingCommissions: number
  commissionsCount: number
  averageCommissionRate: number
}

interface ProfessionalStats {
  professionalId: string
  professionalName: string
  email: string
  position: string
  totalCommissions: number
  paidCommissions: number
  pendingCommissions: number
  appointmentCount: number
  averageCommissionRate: number
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

const STATUS_LABELS = {
  pending: 'Pendente',
  paid: 'Pago',
  cancelled: 'Cancelado',
}

export default function CommissionManagementClient() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [professionalStats, setProfessionalStats] = useState<ProfessionalStats[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [professionalFilter, setProfessionalFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const loadData = async (status?: string) => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (professionalFilter && professionalFilter !== 'all') params.append('professionalId', professionalFilter)
      if (status && status !== 'all') params.append('status', status)

      const response = await fetch(`/api/professional-commissions?${params.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar comissões')
      }

      const data = await response.json()
      setCommissions(data.commissions)
      setSummary(data.summary)
      setProfessionalStats(data.professionalStats)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApplyFilters = () => {
    loadData(statusFilter)
  }

  const handleUpdateStatus = async (commissionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/professional-commissions', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: commissionId, status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar comissão')
      }

      toast.success('Status atualizado com sucesso')
      loadData(statusFilter)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar comissão'
      toast.error(errorMessage)
    }
  }

  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx')
      
      // Dados das comissões detalhadas
      const commissionsData = [
        ['Profissional', 'Cargo', 'Serviço', 'Cliente', 'Valor Serviço (R$)', 'Taxa (%)', 'Comissão (R$)', 'Período', 'Status'],
        ...commissions.map(com => [
          com.employees?.name || '',
          com.employees?.position || '',
          com.service_name,
          com.customer_name,
          parseFloat(com.service_price.toString()),
          com.commission_rate,
          parseFloat(com.commission_amount.toString()),
          format(new Date(com.commission_period), 'dd/MM/yyyy', { locale: ptBR }),
          STATUS_LABELS[com.status]
        ])
      ]

      // Dados do resumo geral
      const summaryData = summary ? [
        ['Resumo Geral de Comissões'],
        [''],
        ['Métrica', 'Valor (R$)'],
        ['Total de Comissões', summary.totalCommissions],
        ['Comissões Pagas', summary.paidCommissions],
        ['Comissões Pendentes', summary.pendingCommissions],
        [''],
        ['Total de Registros', summary.commissionsCount],
        ['Taxa Média (%)', summary.averageCommissionRate]
      ] : []

      // Dados por profissional
      const professionalData = [
        ['Profissional', 'Cargo', 'Total (R$)', 'Pago (R$)', 'Pendente (R$)', 'Serviços', 'Taxa Média (%)'],
        ...professionalStats.map(prof => [
          prof.professionalName,
          prof.position,
          prof.totalCommissions,
          prof.paidCommissions,
          prof.pendingCommissions,
          prof.appointmentCount,
          prof.averageCommissionRate
        ])
      ]

      // Criar workbook
      const wb = XLSX.utils.book_new()
      
      // Adicionar planilhas
      const wsCommissions = XLSX.utils.aoa_to_sheet(commissionsData)
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
      const wsProfessional = XLSX.utils.aoa_to_sheet(professionalData)
      
      XLSX.utils.book_append_sheet(wb, wsCommissions, 'Comissões Detalhadas')
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Geral')
      XLSX.utils.book_append_sheet(wb, wsProfessional, 'Por Profissional')
      
      // Exportar
      XLSX.writeFile(wb, `comissoes_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
      toast.success('Arquivo Excel exportado com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar Excel')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Gestão de Comissões</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe e gerencie as comissões dos profissionais
          </p>
        </div>
        <Button onClick={handleExportExcel} disabled={!commissions.length} className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-300 text-xs sm:text-sm" variant="outline" size="sm">
          <FileBarChart className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Exportar Excel</span>
          <span className="sm:hidden">Excel</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Data Inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Data Final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Profissional</label>
              <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {professionalStats.map((prof) => (
                      <SelectItem key={prof.professionalId} value={prof.professionalId}>
                        {prof.professionalName}
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end sm:col-span-2 md:col-span-1">
              <Button onClick={handleApplyFilters} disabled={loading} className="w-full text-xs sm:text-sm" size="sm">
                {loading ? 'Carregando...' : 'Aplicar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          <Card className="border-green-200 bg-linear-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1 sm:gap-2">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Total de Comissões</span>
                <span className="sm:hidden">Total</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                R$ {summary.totalCommissions.toFixed(0)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1 sm:gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Pagas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <p className="text-lg sm:text-2xl font-bold text-blue-600">
                R$ {summary.paidCommissions.toFixed(0)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-linear-to-br from-yellow-50 to-orange-50">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1 sm:gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                R$ {summary.pendingCommissions.toFixed(0)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-linear-to-br from-purple-50 to-pink-50">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Registros</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <p className="text-lg sm:text-2xl font-bold text-purple-600">
                {summary.commissionsCount}
              </p>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 bg-linear-to-br from-indigo-50 to-blue-50 col-span-2 sm:col-span-1">
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Taxa Média</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <p className="text-lg sm:text-2xl font-bold text-indigo-600">
                {summary.averageCommissionRate.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Professional Stats Charts */}
      {professionalStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm sm:text-base">Comissões por Profissional</CardTitle>
              <CardDescription className="text-xs">Comparativo de comissões totais</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={professionalStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="professionalName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="totalCommissions" fill="#10b981" name="Total" />
                  <Bar dataKey="paidCommissions" fill="#3b82f6" name="Pago" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm sm:text-base">Distribuição de Comissões</CardTitle>
              <CardDescription className="text-xs">Percentual por profissional</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-2 sm:p-4">
              {professionalStats.length > 0 && summary ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={professionalStats.map((p) => ({
                        name: p.professionalName,
                        value: parseFloat(p.totalCommissions.toString()),
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => {
                        const value = (entry as unknown as Record<string, unknown>).value as number
                        const name = (entry as unknown as Record<string, unknown>).name as string
                        return `${name}: ${((value / summary.totalCommissions) * 100).toFixed(1)}%`
                      }}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {professionalStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Professional Summary Table */}
      {professionalStats.length > 0 && (
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm sm:text-base">Resumo por Profissional</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-xs sm:text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium">Profissional</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium hidden sm:table-cell">Cargo</th>
                    <th className="text-right py-2 px-2 sm:py-3 sm:px-4 font-medium">Total</th>
                    <th className="text-right py-2 px-2 sm:py-3 sm:px-4 font-medium hidden md:table-cell">Pago</th>
                    <th className="text-right py-2 px-2 sm:py-3 sm:px-4 font-medium hidden md:table-cell">Pendente</th>
                    <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-medium hidden lg:table-cell">Serviços</th>
                    <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-medium hidden lg:table-cell">Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {professionalStats.map((prof) => (
                    <tr key={prof.professionalId} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 sm:py-3 sm:px-4 font-medium">{prof.professionalName}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-4 hidden sm:table-cell">{prof.position}</td>
                      <td className="text-right py-2 px-2 sm:py-3 sm:px-4 font-bold text-green-600">
                        {prof.totalCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-right py-2 px-2 sm:py-3 sm:px-4 text-blue-600 hidden md:table-cell">
                        {prof.paidCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-right py-2 px-2 sm:py-3 sm:px-4 text-yellow-600 hidden md:table-cell">
                        {prof.pendingCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-center py-2 px-2 sm:py-3 sm:px-4 hidden lg:table-cell">
                        <Badge variant="secondary" className="text-xs">{prof.appointmentCount}</Badge>
                      </td>
                      <td className="text-center py-2 px-2 sm:py-3 sm:px-4 font-medium hidden lg:table-cell">
                        {prof.averageCommissionRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Commissions Table */}
      {commissions.length > 0 && (
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm sm:text-base">Detalhamento de Comissões</CardTitle>
            <CardDescription className="text-xs">{commissions.length} registros encontrados</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Profissional</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Serviço</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Cliente</TableHead>
                    <TableHead className="text-xs">Valor</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Período</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((com) => (
                    <TableRow key={com.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-xs">{com.employees?.name}</TableCell>
                      <TableCell className="text-xs hidden sm:table-cell">{com.service_name}</TableCell>
                      <TableCell className="text-xs hidden md:table-cell">{com.customer_name}</TableCell>
                      <TableCell className="text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-500 text-xs">Serviço: {parseFloat(com.service_price.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="text-gray-500 text-xs">Taxa: {com.commission_rate.toFixed(1)}%</span>
                          <span className="font-bold text-green-600">Comissão: {parseFloat(com.commission_amount.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs hidden md:table-cell">{format(new Date(com.commission_period), 'dd/MM', { locale: ptBR })}</TableCell>
                      <TableCell>
                        <Select
                          value={com.status}
                          onValueChange={(newStatus) => handleUpdateStatus(com.id, newStatus)}
                        >
                          <SelectTrigger className="w-20 sm:w-28 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending" className="text-xs">Pendente</SelectItem>
                            <SelectItem value="paid" className="text-xs">Pago</SelectItem>
                            <SelectItem value="cancelled" className="text-xs">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {commissions.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Nenhum registro de comissão encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
