"use client"

import { useEffect, useState } from 'react'
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppointmentWithService } from './appointment-list'
import { formatCurrancy } from '@/utils/formatCurrency'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

function formatDateBRString(ymd: string | undefined): string {
  if (!ymd) return '-'
  const [y, m, d] = ymd.split('-')
  return `${d}/${m}/${y}` // ex: 07/12/2025
}

function formatTimeBR(time: string | undefined): string {
  if (!time) return '-'
  const [h, m] = time.split(':')
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}` // ex: 12:00
}

function formatDuration(duration: string | number | undefined): string {
  if (!duration) return '-'
  
  let minutes = 0
  if (typeof duration === 'number') {
    minutes = duration
  } else {
    let durationStr = String(duration).trim()
    if (durationStr.includes(' minutos')) {
      durationStr = durationStr.replace(' minutos', '').trim()
    }
    if (durationStr.includes(':')) {
      const parts = durationStr.split(':')
      if (parts.length >= 2) {
        const firstPart = parseInt(parts[0], 10)
        const secondPart = parseInt(parts[1], 10)
        if (firstPart >= 60) {
          minutes = firstPart
        } else {
          minutes = firstPart * 60 + secondPart
        }
      }
    } else {
      const num = parseInt(durationStr, 10)
      if (!isNaN(num)) minutes = num
    }
  }
  
  if (minutes === 0) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

interface DialogAppointmentProps {
  appointment: AppointmentWithService | null
  startEditing?: boolean
}

export function DialogAppointment({ appointment, startEditing }: DialogAppointmentProps) {
  const ap = appointment ?? null

  const [editingMode, setEditingMode] = useState(false)
  const [editable, setEditable] = useState<any>({
    status: ap?.status ?? 'pending',
    appointment_time: ap?.appointment_time?.substring(0, 5) ?? '',
  })

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const timeOptions = Array.from({ length: 23 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2)
    const minute = i % 2 === 0 ? '00' : '30'
    return `${String(hour).padStart(2, '0')}:${minute}`
  })

  // Carregar horários disponíveis quando entrar em modo de edição
  useEffect(() => {
    if (editingMode && ap?.professional_id && ap?.appointment_date) {
      loadAvailableSlots()
    }
  }, [editingMode, ap?.professional_id, ap?.appointment_date])

  const loadAvailableSlots = async () => {
    if (!ap?.professional_id || !ap?.appointment_date) return
    
    setLoadingSlots(true)
    try {
      // Buscar bloqueios do profissional
      const response = await fetch(`/api/schedule/blocks?date=${ap.appointment_date}&professionalId=${ap.professional_id}`)
      const data = await response.json()
      
      const blockedTimes = new Set()
      
      // Adicionar horários bloqueados
      if (data.blocks) {
        data.blocks.forEach((block: any) => {
          const startTime = block.start_time
          const endTime = block.end_time
          
          // Bloquear todos os slots entre start e end
          timeOptions.forEach(slot => {
            if (slot >= startTime && slot < endTime) {
              blockedTimes.add(slot)
            }
          })
        })
      }
      
      // Filtrar horários disponíveis
      const available = timeOptions.filter(slot => !blockedTimes.has(slot))
      setAvailableTimeSlots(available)
      
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
      setAvailableTimeSlots(timeOptions) // Fallback para todos os horários
    } finally {
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    setEditable({
      status: ap?.status ?? 'pending',
      appointment_time: ap?.appointment_time?.substring(0, 5) ?? '',
    })
  }, [ap])

  useEffect(() => {
    if (startEditing) setEditingMode(true)
  }, [startEditing])

  async function handleSaveEdits() {
    if (!ap) return
    
    const supabase = createClient()
    const updates = {
      status: editable.status ?? 'pending',
      appointment_time: editable.appointment_time ? `${editable.appointment_time}:00` : ap.appointment_time,
    }
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', ap.id)
      
      if (error) {
        console.error('Failed to save appointment edits', error)
        toast.error('Falha ao salvar alterações')
        return
      }
      
      toast.success('Alterações salvas')
      setEditingMode(false)
    } catch (e) {
      console.error('Save error', e)
      toast.error('Erro ao salvar alterações')
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Detalhes do Agendamento</DialogTitle>
        <DialogDescription>Informações do cliente e serviço</DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[60vh] pr-2">
        <div className="py-4 space-y-4 text-sm">
          {!ap && (
            <div className="text-sm text-muted-foreground">Selecione um agendamento para ver detalhes.</div>
          )}
          
          {ap && (
            <>
              {/* Data e Hora */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Data</p>
                    <p className="text-muted-foreground">
                      {ap.appointment_date?.split('-').reverse().join('/') || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Hora</p>
                    {editingMode ? (
                      <Select 
                        value={editable.appointment_time ?? ''} 
                        onValueChange={(value) => setEditable((p: any) => ({ ...p, appointment_time: value }))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingSlots ? (
                            <SelectItem value="" disabled>Carregando horários...</SelectItem>
                          ) : (
                            availableTimeSlots.map((time) => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-muted-foreground">
                        {formatTimeBR(ap.appointment_time)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cliente */}
              {ap.customer && (
                <div className="space-y-2 border-t pt-4">
                  <p className="font-semibold">Cliente</p>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Nome:</span> {ap.customer.name}</p>
                    <p><span className="font-medium">Telefone:</span> {ap.customer.phone}</p>
                  </div>
                </div>
              )}

              {/* Serviço */}
              {ap.service && (
                <div className="space-y-2 border-t pt-4">
                  <p className="font-semibold">Serviço</p>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Nome:</span> {ap.service.name}</p>
                    <p><span className="font-medium">Duração:</span> {formatDuration(ap.service.duration)}</p>
                    <p><span className="font-medium">Preço:</span> {formatCurrancy(ap.service.price / 100)}</p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="space-y-2 border-t pt-4">
                <p className="font-semibold">Status</p>
                {editingMode ? (
                  <Select 
                    value={editable.status ?? 'pending'} 
                    onValueChange={(value) => setEditable((p: any) => ({ ...p, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-muted-foreground capitalize">
                    {ap.status === 'pending' && 'Pendente'}
                    {ap.status === 'confirmed' && 'Confirmado'}
                    {ap.status === 'completed' && 'Concluído'}
                    {ap.status === 'cancelled' && 'Cancelado'}
                  </p>
                )}
              </div>

              {/* Metadados */}
              <div className="text-xs text-muted-foreground border-t pt-4 space-y-1">
                <p>Criado em: {ap.created_at ? new Date(ap.created_at).toLocaleDateString('pt-BR') : '-'}</p>
                <p>Atualizado em: {ap.updated_at ? new Date(ap.updated_at).toLocaleDateString('pt-BR') : '-'}</p>
              </div>

              {/* Botões */}
              <div className="pt-4 flex items-center gap-2 border-t">
                {!editingMode && (
                  <Button variant="default" onClick={() => setEditingMode(true)}>
                    Editar
                  </Button>
                )}
                {editingMode && (
                  <>
                    <Button onClick={handleSaveEdits}>
                      Salvar alterações
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setEditingMode(false)
                        setEditable({
                          status: ap.status ?? 'pending',
                          appointment_time: ap.appointment_time?.substring(0, 5) ?? '',
                        })
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </DialogContent>
  )
}
