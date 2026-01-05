'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit2, Search, Phone, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ClientDialog } from './client-dialog'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Customer = {
  id: string
  name: string
  phone: string
  created_at: string
  last_name?: string
  birth_date?: string
}

export function ClientsPageClient() {
  const supabase = createClient()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (err: unknown) {
      const error = err as Record<string, unknown>
      toast.error((error.message as string) || 'Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Cliente removido com sucesso')
      setDeleteConfirm(null)
      loadCustomers()
    } catch (err: unknown) {
      const error = err as Record<string, unknown>
      toast.error((error.message as string) || 'Erro ao remover cliente')
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingCustomer(null)
  }

  const handleClientSaved = () => {
    handleDialogClose()
    loadCustomers()
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Gerenciar e acompanhar clientes do sistema
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCustomer(null)
            setIsDialogOpen(true)
          }}
          className="gap-2"
          data-tour="add-customer"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resultados da Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCustomers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Ocupação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.length > 0 ? '100%' : '0%'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Grid */}
      <Card data-tour="customer-list">
        <CardHeader>
          <CardTitle>Listagem de Clientes</CardTitle>
          <CardDescription>
            {filteredCustomers.length} cliente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Carregando clientes...</div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {customer.name}
                        {customer.last_name && <span className="ml-1">{customer.last_name}</span>}
                      </h3>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-blue-50"
                        onClick={() => {
                          setEditingCustomer(customer)
                          setIsDialogOpen(true)
                        }}
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-50"
                        onClick={() =>
                          setDeleteConfirm({ id: customer.id, name: customer.name })
                        }
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.birth_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className="text-xs">
                          {format(new Date(customer.birth_date), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs">
                        {format(new Date(customer.created_at), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ClientDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={editingCustomer}
        onClose={handleDialogClose}
        onSaved={handleClientSaved}
      />

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        customerName={deleteConfirm?.name || ''}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
      />
    </div>
  )
}
