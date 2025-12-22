'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit2, Search, TrendingUp, TrendingDown, DollarSign, Calendar, Download, FileSpreadsheet, FileBarChart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { TransactionDialog } from './transaction-dialog'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import CommissionManagementClient from './commission-management-client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Transaction = {
  id: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  date: string
  payment_method?: string
  status: 'pending' | 'completed' | 'cancelled'
  created_at?: string
  appointment_id?: string | null
  appointments?: {
    id: string
    appointment_date: string
    appointment_time: string
    status: string
    customers?: {
      id: string
      name: string
      phone: string
    }
    services?: {
      id: string
      name: string
      duration: number
      price: number
    }
  } | null
}

export function FinancePageClient() {
  const supabase = createClient()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'quarter' | 'semester' | 'year'>('month')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; description: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [dateRange])

  const loadTransactions = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({ dateRange })
      const res = await fetch(`/api/financeiro/transactions?${params}`)
      
      if (!res.ok) {
        throw new Error('Erro ao carregar transações')
      }

      const { data } = await res.json()
      setTransactions(data || [])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(true)
      const res = await fetch(`/api/financeiro/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Erro ao remover transação')
      }

      toast.success('Transação removida com sucesso')
      setDeleteConfirm(null)
      loadTransactions()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover transação')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingTransaction(null)
  }

  const handleTransactionSaved = () => {
    handleDialogClose()
    loadTransactions()
  }

  const exportToExcel = async () => {
    setExportLoading(true)
    try {
      const XLSX = await import('xlsx')
      
      // Dados das transações
      const transactionsData = [
        ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'],
        ...filteredTransactions.map(tx => [
          format(new Date(tx.date), 'dd/MM/yyyy', { locale: ptBR }),
          tx.description,
          tx.category,
          tx.type === 'income' ? 'Receita' : 'Despesa',
          tx.amount,
          getStatusLabel(tx.status)
        ])
      ]

      // Dados do resumo
      const summaryData = [
        ['Resumo Financeiro'],
        [''],
        ['Métrica', 'Valor (R$)'],
        ['Receitas', totalIncome],
        ['Despesas', totalExpense],
        ['Saldo', balance],
        ['Pendente', totalPending]
      ]

      // Dados por categoria (Receitas)
      const incomeCategoryData: any[] = [['Categoria', 'Valor (R$)']]
      const incomeByCategory: Record<string, number> = {}
      filteredTransactions
        .filter(tx => tx.type === 'income' && tx.status === 'completed')
        .forEach(tx => {
          incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount
        })
      Object.entries(incomeByCategory).forEach(([cat, val]) => {
        incomeCategoryData.push([cat, val])
      })

      // Dados por categoria (Despesas)
      const expenseCategoryData: any[] = [['Categoria', 'Valor (R$)']]
      const expenseByCategory: Record<string, number> = {}
      filteredTransactions
        .filter(tx => tx.type === 'expense' && tx.status === 'completed')
        .forEach(tx => {
          expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount
        })
      Object.entries(expenseByCategory).forEach(([cat, val]) => {
        expenseCategoryData.push([cat, val])
      })

      // Criar workbook
      const wb = XLSX.utils.book_new()
      
      // Adicionar planilhas
      const wsTransactions = XLSX.utils.aoa_to_sheet(transactionsData)
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
      const wsIncomeCategory = XLSX.utils.aoa_to_sheet(incomeCategoryData)
      const wsExpenseCategory = XLSX.utils.aoa_to_sheet(expenseCategoryData)
      
      XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transações')
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo')
      XLSX.utils.book_append_sheet(wb, wsIncomeCategory, 'Receitas por Categoria')
      XLSX.utils.book_append_sheet(wb, wsExpenseCategory, 'Despesas por Categoria')
      
      // Exportar
      XLSX.writeFile(wb, `financeiro_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
      toast.success('Arquivo Excel exportado com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar Excel')
    } finally {
      setExportLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedType === 'all' || tx.type === selectedType
    const matchesStatus = selectedStatus === 'all' || tx.status === selectedStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Calculations
  const totalIncome = filteredTransactions
    .filter((tx) => tx.type === 'income' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalExpense = filteredTransactions
    .filter((tx) => tx.type === 'expense' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalPending = filteredTransactions
    .filter((tx) => tx.status === 'pending')
    .reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0)

  const balance = totalIncome - totalExpense

  // Colors for pie charts
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
  const EXPENSE_COLORS = ['#ef4444', '#f97316', '#eab308', '#a16207', '#dc2626', '#b91c1c', '#991b1b']

  // Get category data for pie charts
  const getCategoryData = (type: 'income' | 'expense') => {
    const categoryMap: Record<string, number> = {}
    
    filteredTransactions
      .filter(tx => tx.type === type && tx.status === 'completed')
      .forEach(tx => {
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount
      })

    return Object.entries(categoryMap).map(([category, value]) => ({
      category,
      value: parseFloat(value.toString()),
    }))
  }



  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído'
      case 'pending':
        return 'Pendente'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Controle Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1 sm:mt-2">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={exportToExcel}
            variant="outline"
            size="sm"
            className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-300 text-xs sm:text-sm"
            disabled={exportLoading || filteredTransactions.length === 0}
            data-tour="export-excel"
          >
            {exportLoading ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileBarChart className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            <span className="hidden sm:inline">Exportar Excel</span>
            <span className="sm:hidden">Excel</span>
          </Button>
          <Button
            onClick={() => {
              setEditingTransaction(null)
              setIsDialogOpen(true)
            }}
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
            data-tour="add-transaction"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Nova Transação</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow bg-linear-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalIncome.toFixed(2)}
            </div>
            <p className="text-xs text-green-600 mt-1">Concluídas</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 shadow-lg hover:shadow-xl transition-shadow bg-linear-to-br from-red-50 to-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalExpense.toFixed(2)}
            </div>
            <p className="text-xs text-red-600 mt-1">Concluídas</p>
          </CardContent>
        </Card>

        <Card className={`border-2 shadow-lg hover:shadow-xl transition-shadow ${balance >= 0 ? 'border-blue-200 bg-linear-to-br from-blue-50 to-cyan-50' : 'border-orange-200 bg-linear-to-br from-orange-50 to-red-50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                <DollarSign className={`w-4 h-4 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              R$ {balance.toFixed(2)}
            </div>
            <p className={`text-xs mt-1 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {balance >= 0 ? 'Positivo' : 'Negativo'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow bg-linear-to-br from-yellow-50 to-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-4 h-4 text-yellow-600" />
              </div>
              Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {Math.abs(totalPending).toFixed(2)}
            </div>
            <p className="text-xs text-yellow-600 mt-1">A receber/pagar</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
            <SelectTrigger className="text-xs sm:text-sm" suppressHydrationWarning>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
            <SelectTrigger className="text-xs sm:text-sm" suppressHydrationWarning>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="text-xs sm:text-sm" suppressHydrationWarning>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="semester">Semestre</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-tour="charts">
        {/* Pie Charts */}
        <Card className="border-2 border-green-100 shadow-md">
          <CardHeader className="bg-linear-to-r from-green-50 to-emerald-50 p-4">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Receitas
            </CardTitle>
            <CardDescription className="text-xs">Por categoria</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-2 sm:p-6">
            {filteredTransactions.filter(t => t.type === 'income').length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getCategoryData('income')}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="category"
                  >
                    {getCategoryData('income').map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-62.5 text-sm text-muted-foreground">
                Nenhuma receita
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-red-100 shadow-md">
          <CardHeader className="bg-linear-to-r from-red-50 to-orange-50 p-4">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              Despesas
            </CardTitle>
            <CardDescription className="text-xs">Por categoria</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-2 sm:p-6">
            {filteredTransactions.filter(t => t.type === 'expense').length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getCategoryData('expense')}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="category"
                  >
                    {getCategoryData('expense').map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-62.5 text-sm text-muted-foreground">
                Nenhuma despesa
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for Transactions and Commissions */}
      <Tabs defaultValue="transactions" className="w-full" suppressHydrationWarning>
        <TabsList className="grid w-full grid-cols-2" suppressHydrationWarning>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm" suppressHydrationWarning>Transações</TabsTrigger>
          <TabsTrigger value="commissions" className="text-xs sm:text-sm" suppressHydrationWarning>Comissões</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Transactions Table */}
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Transações
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    {filteredTransactions.length} encontrada(s)
                  </CardDescription>
                </div>
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white hover:bg-green-50 text-green-700 border-green-300 text-xs"
                  disabled={exportLoading || filteredTransactions.length === 0}
                >
                  {exportLoading ? (
                    <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-3 h-3" />
                  )}
                  Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-muted-foreground">Carregando...</div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-muted-foreground">
                {searchTerm ? 'Nenhuma transação encontrada' : 'Nenhuma transação cadastrada'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Data</TableHead>
                    <TableHead className="text-xs">Descrição</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Categoria</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Tipo</TableHead>
                    <TableHead className="text-xs">Valor</TableHead>
                    <TableHead className="text-xs hidden lg:table-cell">Status</TableHead>
                    <TableHead className="text-xs text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.flatMap((transaction) => {
                    const rows = [
                      <TableRow key={transaction.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell className="text-xs" onClick={() => setExpandedTransactionId(expandedTransactionId === transaction.id ? null : transaction.id)}>
                          {format(new Date(transaction.date), 'dd/MM', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-medium text-xs" onClick={() => setExpandedTransactionId(expandedTransactionId === transaction.id ? null : transaction.id)}>
                          <div className="max-w-30 sm:max-w-none truncate">{transaction.description}</div>
                          {transaction.appointments && (
                            <span className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                              <Calendar className="w-2 h-2" />
                              Agend.
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs hidden sm:table-cell" onClick={() => setExpandedTransactionId(expandedTransactionId === transaction.id ? null : transaction.id)}>
                          <div className="max-w-25 truncate">{transaction.category}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell" onClick={() => setExpandedTransactionId(expandedTransactionId === transaction.id ? null : transaction.id)}>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="w-2 h-2" />
                            ) : (
                              <TrendingDown className="w-2 h-2" />
                            )}
                            {transaction.type === 'income' ? 'Rec' : 'Desp'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs" onClick={() => setExpandedTransactionId(expandedTransactionId === transaction.id ? null : transaction.id)}>
                          <span className={transaction.type === 'income' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(0)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell" onClick={() => setExpandedTransactionId(expandedTransactionId === transaction.id ? null : transaction.id)}>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadgeColor(transaction.status)}`}>
                            {getStatusLabel(transaction.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                              onClick={() => {
                                setEditingTransaction(transaction)
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
                                  id: transaction.id,
                                  description: transaction.description,
                                })
                              }
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ]

                    if (expandedTransactionId === transaction.id && transaction.appointments) {
                      rows.push(
                        <TableRow key={`${transaction.id}-expanded`} className="bg-blue-50">
                          <TableCell colSpan={7} className="py-4">
                            <div className="bg-white rounded-lg border border-blue-200 p-4">
                              <div className="flex items-center gap-2 mb-3 font-medium text-blue-700">
                                <Calendar className="w-4 h-4" />
                                Detalhes do Agendamento
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-600">Cliente:</span>
                                  <p className="font-medium">{transaction.appointments.customers?.name}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Data:</span>
                                  <p className="font-medium">
                                    {format(parseISO(transaction.appointments.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Hora:</span>
                                  <p className="font-medium">{transaction.appointments.appointment_time}</p>
                                </div>
                                {transaction.appointments.services && (
                                  <>
                                    <div>
                                      <span className="text-gray-600">Serviço:</span>
                                      <p className="font-medium">{transaction.appointments.services.name}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Duração:</span>
                                      <p className="font-medium">{transaction.appointments.services.duration} min</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Valor:</span>
                                      <p className="font-medium text-green-600">R$ {transaction.appointments.services.price.toFixed(2)}</p>
                                    </div>
                                  </>
                                )}
                                <div>
                                  <span className="text-gray-600">Status do Agendamento:</span>
                                  <p className="font-medium">{transaction.appointments.status}</p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    }

                    return rows
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Commission Management Tab */}
        <TabsContent value="commissions" className="space-y-6">
          <CommissionManagementClient />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        transaction={editingTransaction}
        onClose={handleDialogClose}
        onSaved={handleTransactionSaved}
      />

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open: boolean) => !open && setDeleteConfirm(null)}
        transactionDescription={deleteConfirm?.description || ''}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        loading={deleteLoading}
      />
    </div>
  )
}
