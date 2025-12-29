'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { ServiceDialog } from './service-dialog'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'


type Service = {
  id: string
  name: string
  duration: string
  price: number | null
  image_url?: string | null
  created_at?: string
}

export function ServicesPageClient() {
  const supabase = createClient()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)

  const loadServices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name')

      if (error) throw error
      setServices(data || [])
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : String(err)) || 'Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [supabase])

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Serviço removido com sucesso')
      setDeleteConfirm(null)
      loadServices()
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : String(err)) || 'Erro ao remover serviço')
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingService(null)
  }

  const handleServiceSaved = () => {
    handleDialogClose()
    loadServices()
  }

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const parseDuration = (durationString: string): string => {
    if (!durationString) return '-'
    
    // Handle format like "00:30:00" or PostgreSQL interval format
    if (durationString.includes(':')) {
      const parts = durationString.split(':')
      const hours = parseInt(parts[0])
      const minutes = parseInt(parts[1])
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      }
      return `${minutes}m`
    }
    
    // Handle PostgreSQL interval format like "30 mins"
    if (durationString.includes('min')) {
      return durationString
    }
    
    return durationString
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground mt-2">
            Gerenciar serviços oferecidos pela empresa
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingService(null)
            setIsDialogOpen(true)
          }}
          className="gap-2"
          data-tour="add-service"
        >
          <Plus className="w-4 h-4" />
          Novo Serviço
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
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
              Total de Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resultados da Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredServices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Serviços com Preço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.filter(s => s.price !== null && s.price !== undefined).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card data-tour="service-list">
        <CardHeader>
          <CardTitle>Listagem de Serviços</CardTitle>
          <CardDescription>
            {filteredServices.length} serviço(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Carregando serviços...</div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">
                {searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="text-xs">
                      {service.image_url ? (
                        <div className="relative w-10 h-10">
                          <Image 
                            src={service.image_url} 
                            alt={service.name}
                            fill
                            className="rounded object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-xs text-gray-500">
                          -
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{parseDuration(service.duration)}</TableCell>
                    <TableCell>
                      {service.price !== null && service.price !== undefined
                        ? `R$ ${(service.price).toFixed(2)}`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingService(service)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteConfirm({ id: service.id, name: service.name })
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ServiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        service={editingService}
        onClose={handleDialogClose}
        onSaved={handleServiceSaved}
      />

      <DeleteConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        serviceName={deleteConfirm?.name || ''}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
      />
    </div>
  )
}
