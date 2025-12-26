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
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, Download, Filter } from 'lucide-react'
import { toast } from 'sonner'

interface ReportData {
  type: 'service' | 'professional' | 'period'
  data: Array<Record<string, unknown>>
  totalRevenue: number
}

export default function ReportsPageClient() {
  const [reportType, setReportType] = useState<'service' | 'professional' | 'period'>('service')
  const [dateRange, setDateRange] = useState<'month' | 'year'>('month')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  useEffect(() => {
    loadReport()
  }, [reportType, dateRange])

  const loadReport = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        type: reportType,
        dateRange: dateRange,
      })

      const response = await fetch(`/api/relatorios/revenue?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Erro ao carregar relatório')
      }

      const data = await response.json()
      setReportData(data)
    } catch (error: Record<string, unknown>) {
      toast.error(error.message || 'Erro ao carregar relatório')
    } finally {
      setLoading(false)
    }
  }

  const handleReportTypeChange = (type: string) => {
    setReportType(type as Record<string, unknown>)
  }



  const handleExportCSV = () => {
    if (!reportData?.data) return

    let csv = ''
    
    if (reportType === 'service') {
      csv = 'Serviço,Total (R$),Quantidade,Percentual (%)\n'
      reportData.data.forEach((item) => {
        csv += `"${item.serviceName}",${item.total.toFixed(2)},${item.count},${item.percentage.toFixed(2)}\n`
      })
    } else if (reportType === 'professional') {
      csv = 'Profissional,Total (R$),Quantidade,Percentual (%)\n'
      reportData.data.forEach((item) => {
        csv += `"${item.professionalName}",${item.total.toFixed(2)},${item.count},${item.percentage.toFixed(2)}\n`
      })
    } else if (reportType === 'period') {
      csv = 'Data,Total (R$),Quantidade\n'
      reportData.data.forEach((item) => {
        csv += `${item.date},${item.total.toFixed(2)},${item.count}\n`
      })
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Relatório exportado com sucesso')
  }

  const getChartData = () => {
    if (!reportData?.data) return []

    if (reportType === 'service') {
      return reportData.data.map((item) => ({
        name: item.serviceName || 'Sem nome',
        value: parseFloat(item.total?.toString() || '0'),
        percentage: item.percentage || 0,
      }))
    } else if (reportType === 'professional') {
      return reportData.data.map((item) => ({
        name: item.professionalName || 'Sem nome',
        value: parseFloat(item.total?.toString() || '0'),
        percentage: item.percentage || 0,
      }))
    } else {
      return reportData.data.map((item) => {
        try {
          const date = new Date(item.date)
          return {
            name: !isNaN(date.getTime()) ? format(date, 'dd/MM', { locale: ptBR }) : item.date,
            value: parseFloat(item.total?.toString() || '0'),
          }
        } catch (e) {
          return {
            name: item.date,
            value: parseFloat(item.total?.toString() || '0'),
          }
        }
      })
    }
  }

  const topPerformer = reportData?.data[0]

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios de Faturamento</h1>
          <p className="text-muted-foreground mt-2">
            Analise o desempenho dos seus serviços e profissionais
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={!reportData} className="gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={handleReportTypeChange}>
                <SelectTrigger suppressHydrationWarning>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Por Serviço</SelectItem>
                  <SelectItem value="professional">Por Profissional</SelectItem>
                  <SelectItem value="period">Por Período</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={dateRange} onValueChange={(value: Record<string, unknown>) => setDateRange(value)}>
                <SelectTrigger suppressHydrationWarning>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="year">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Data Message */}
      {!loading && reportData && reportData.data.length === 0 && (
        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-lg font-medium text-yellow-800 mb-2">
                Nenhum dado encontrado
              </p>
              <p className="text-sm text-yellow-600">
                {reportType === 'service' || reportType === 'professional'
                  ? 'Certifique-se de que existem transações de receita vinculadas a agendamentos com serviços e profissionais.'
                  : 'Não há transações de receita no período selecionado.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      {reportData && reportData.data.length > 0 && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Faturamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Receita Total</p>
                <p className="text-3xl font-bold text-green-600">
                  R$ {(reportData.totalRevenue || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Itens</p>
                <p className="text-3xl font-bold text-blue-600">
                  {reportData.data.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {reportType === 'service' ? 'Serviço Mais Rentável' : reportType === 'professional' ? 'Profissional Mais Rentável' : 'Dia com Maior Faturamento'}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {topPerformer ? 
                    (reportType === 'service' ? topPerformer.serviceName : 
                     reportType === 'professional' ? topPerformer.professionalName :
                     (() => {
                       try {
                         const date = new Date(topPerformer.date)
                         return !isNaN(date.getTime()) ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : topPerformer.date
                       } catch (e) {
                         return topPerformer.date
                       }
                     })())
                   : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {reportData && reportData.data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {reportType === 'service' ? 'Faturamento por Serviço' :
                 reportType === 'professional' ? 'Faturamento por Profissional' :
                 'Faturamento Diário'}
              </CardTitle>
              <CardDescription>Comparativo de valores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {reportType === 'period' ? (
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: Record<string, unknown>) => `R$ ${value.toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#10b981" name="Faturamento" />
                  </LineChart>
                ) : (
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: Record<string, unknown>) => `R$ ${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="value" fill="#10b981" name="Faturamento" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribuição de Faturamento</CardTitle>
              <CardDescription>Percentual por categoria</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {reportType !== 'period' && reportData.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: Record<string, unknown>) => `${entry.percentage?.toFixed(1) || '0'}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: Record<string, unknown>) => `R$ ${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  {reportType === 'period' ? 'Gráfico de pizza não disponível para período' : 'Sem dados para exibir'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Table */}
      {reportData && reportData.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">
                      {reportType === 'service' ? 'Serviço' :
                       reportType === 'professional' ? 'Profissional' :
                       'Data'}
                    </th>
                    <th className="text-right py-3 px-4 font-medium">Faturamento (R$)</th>
                    <th className="text-right py-3 px-4 font-medium">Quantidade</th>
                    {reportType !== 'period' && (
                      <th className="text-right py-3 px-4 font-medium">Percentual (%)</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {reportType === 'service' ? item.serviceName :
                         reportType === 'professional' ? item.professionalName :
                         (() => {
                          try {
                            const date = new Date(item.date)
                            return !isNaN(date.getTime()) ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : item.date
                          } catch (e) {
                            return item.date
                          }
                        })()}
                      </td>
                      <td className="text-right py-3 px-4 font-medium text-green-600">
                        R$ {parseFloat(item.total?.toString() || '0').toFixed(2)}
                      </td>
                      <td className="text-right py-3 px-4">{item.count || 0}</td>
                      {reportType !== 'period' && (
                        <td className="text-right py-3 px-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {(item.percentage || 0).toFixed(2)}%
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
