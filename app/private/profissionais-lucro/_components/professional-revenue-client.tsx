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
import { TrendingUp, Download, Filter } from 'lucide-react'
import { toast } from 'sonner'

interface ProfessionalRevenue {
  id: string
  professional_id: string
  appointment_id: string
  transaction_id: string | null
  service_name: string
  customer_name: string
  revenue: number
  revenue_date: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  employees?: {
    id: string
    name: string
    email: string
    position: string
  }
}

interface Summary {
  totalRevenue: number
  completedRevenue: number
  pendingRevenue: number
  recordCount: number
}

interface ProfessionalStats {
  professionalId: string
  professionalName: string
  email: string
  position: string
  totalRevenue: number
  completedRevenue: number
  pendingRevenue: number
  appointmentCount: number
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUS_LABELS = {
  pending: 'Pendente',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function ProfessionalRevenueClient() {
  const [revenues, setRevenues] = useState<ProfessionalRevenue[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [professionalStats, setProfessionalStats] = useState<ProfessionalStats[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedProfessional, setExpandedProfessional] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (status?: string) => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      // only append status if a real filter is selected
      if (status && status !== 'all') params.append('status', status)

      const response = await fetch(`/api/professional-revenue?${params.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar lucro dos profissionais')
      }

      const data = await response.json()
      setRevenues(data.revenues)
      setSummary(data.summary)
      setProfessionalStats(data.professionalStats)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = () => {
    loadData(statusFilter)
  }

  const handleUpdateStatus = async (revenueId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/professional-revenue', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: revenueId, status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }

      toast.success('Status atualizado com sucesso')
      loadData(statusFilter)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status')
    }
  }

  const handleExportCSV = () => {
    let csv = 'Profissional,Cargo,Cliente,Serviço,Data,Hora,Lucro (R$),Status\n'

    revenues.forEach((rev) => {
      csv += `"${rev.employees?.name || ''}","${rev.employees?.position || ''}","${rev.customer_name}","${rev.service_name}",${rev.revenue_date},${rev.appointment_time},${rev.revenue.toFixed(2)},${STATUS_LABELS[rev.status]}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `lucro-profissionais-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Relatório exportado com sucesso')
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lucro dos Profissionais</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe o faturamento e lucro gerado por cada profissional
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={!revenues.length} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleApplyFilters} disabled={loading} className="w-full">
                {loading ? 'Carregando...' : 'Aplicar Filtros'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Lucro Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                R$ {summary.totalRevenue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Concluído</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                R$ {summary.completedRevenue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                R$ {summary.pendingRevenue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">
                {summary.recordCount}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Professional Stats Charts */}
      {professionalStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lucro por Profissional</CardTitle>
              <CardDescription>Comparativo de faturamento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={professionalStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="professionalName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#10b981" name="Lucro Total" />
                  <Bar dataKey="completedRevenue" fill="#3b82f6" name="Concluído" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribuição de Lucro</CardTitle>
              <CardDescription>Percentual por profissional</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {professionalStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={professionalStats.map((p) => ({
                        name: p.professionalName,
                        value: parseFloat(p.totalRevenue.toString()),
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name}: ${((entry.value / summary!.totalRevenue) * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {professionalStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
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
          <CardHeader>
            <CardTitle className="text-base">Resumo por Profissional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Profissional</th>
                    <th className="text-left py-3 px-4 font-medium">Cargo</th>
                    <th className="text-right py-3 px-4 font-medium">Lucro Total (R$)</th>
                    <th className="text-right py-3 px-4 font-medium">Concluído (R$)</th>
                    <th className="text-right py-3 px-4 font-medium">Pendente (R$)</th>
                    <th className="text-center py-3 px-4 font-medium">Agendamentos</th>
                  </tr>
                </thead>
                <tbody>
                  {professionalStats.map((prof) => (
                    <tr
                      key={prof.professionalId}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        setExpandedProfessional(
                          expandedProfessional === prof.professionalId ? null : prof.professionalId
                        )
                      }
                    >
                      <td className="py-3 px-4 font-medium">{prof.professionalName}</td>
                      <td className="py-3 px-4">{prof.position}</td>
                      <td className="text-right py-3 px-4 font-bold text-green-600">
                        R$ {prof.totalRevenue.toFixed(2)}
                      </td>
                      <td className="text-right py-3 px-4 text-blue-600">
                        R$ {prof.completedRevenue.toFixed(2)}
                      </td>
                      <td className="text-right py-3 px-4 text-yellow-600">
                        R$ {prof.pendingRevenue.toFixed(2)}
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="secondary">{prof.appointmentCount}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Revenue Table */}
      {revenues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhamento de Lucro</CardTitle>
            <CardDescription>{revenues.length} registros encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Lucro (R$)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenues.map((rev) => (
                    <TableRow key={rev.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{rev.employees?.name}</TableCell>
                      <TableCell>{rev.customer_name}</TableCell>
                      <TableCell>{rev.service_name}</TableCell>
                      <TableCell>{format(new Date(rev.revenue_date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      <TableCell>{rev.appointment_time}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        R$ {parseFloat(rev.revenue.toString()).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={rev.status}
                          onValueChange={(newStatus) => handleUpdateStatus(rev.id, newStatus)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
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

      {revenues.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Nenhum registro de lucro encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
