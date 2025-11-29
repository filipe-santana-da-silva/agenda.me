'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'

import { useDialogRecreatorForm, DialogRecreatorFormData, formatRG, formatCPF } from './dialog-recreator-form'
import { createRecreator } from '../_actions/create-recreator'
import { updateRecreator } from '../_actions/update'

interface DialogServiceProps {
  closeModal: () => void
  recreadorId?: string
  initialValues?: DialogRecreatorFormData
}

const weekDays = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
const specialties = ['recreacao', 'pintura', 'balonismo', 'oficina'] as const

export function DialogService({
  closeModal,
  recreadorId,
  initialValues,
}: DialogServiceProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const form = useDialogRecreatorForm({ initialValues })

  async function onSubmit(values: DialogRecreatorFormData) {
    setLoading(true)

    const response = recreadorId
      ? await updateRecreator({ recreadorId, ...values })
      : await createRecreator(values)

    setLoading(false)

    if (response.error) {
      toast.error(response.error)
      return
    }

    toast.success(recreadorId ? 'Recreador atualizado com sucesso!' : 'Recreador cadastrado com sucesso!')
    handleCloseModal()
    router.refresh()
  }

  function handleCloseModal() {
    form.reset()
    closeModal()
  }

  function toggleDay(day: string) {
    const current = form.getValues('availabledays') || []
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day]

    form.setValue('availabledays', updated)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{recreadorId ? 'Editar Recreador' : 'Adicionar Recreador'}</DialogTitle>
        <DialogDescription>adicione um novo recreador</DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Recreador</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />



          <FormField control={form.control} name="rg" render={({ field }) => (
            <FormItem>
              <FormLabel>RG</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    const formatted = formatRG(e.target.value)
                    field.onChange(formatted)
                  }}
                  maxLength={12}
                  placeholder="XX.XXX.XXX-X"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="cpf" render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    const formatted = formatCPF(e.target.value)
                    field.onChange(formatted)
                  }}
                  maxLength={14}
                  placeholder="XXX.XXX.XXX-XX"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (Whatsapp)</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="pixKey" render={({ field }) => (
            <FormItem>
              <FormLabel>Chave PIX</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="uniformSize" render={({ field }) => (
            <FormItem>
              <FormLabel>Tamanho do uniforme</FormLabel>
              <FormControl>
                <Select onValueChange={(v) => field.onChange(v || '')} defaultValue={field.value ?? ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- selecione --" />
                  </SelectTrigger>
                  <SelectContent>
                    {['PP','P','M','G','GG'].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
              <FormLabel>Observação</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="organizer" render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={Boolean(field.value)} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                </FormControl>
                <FormLabel className="m-0">Organizador</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )} />

          {/* Skills: show star pickers for each of the four specialties (moved down to reduce dialog height) */}
          {/* Collapsible with compact trigger showing top skill and small stars; opens by default when editing */}
          <Collapsible defaultOpen={!!recreadorId}>
            <CollapsibleTrigger asChild>
              {/** trigger shows current top skill + small stars, updates via form.watch */}
              <button type="button" className="w-full text-left px-2 py-2 rounded bg-gray-50 border border-gray-200">
                {(() => {
                  const skills = form.watch('skills') || { recreacao: 0, pintura: 0, balonismo: 0, oficina: 0 }
                  const entries = Object.entries(skills) as [string, number][]
                  const top = entries.reduce((acc, cur) => (cur[1] > acc[1] ? cur : acc), entries[0])
                  const label = top ? top[0] : 'recreacao'
                  const level = top ? top[1] : 0
                  return (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs capitalize">{label}</span>
                        <div className="flex">
                          {[1,2,3,4,5].map((star) => (
                            <span key={star} className={`text-sm ${level >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">Editar</span>
                    </div>
                  )
                })()}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-2">
                {specialties.map((s) => (
                  <FormField key={s} control={form.control} name={`skills.${s}`} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">{s.charAt(0).toUpperCase() + s.slice(1)}</FormLabel>
                      <FormControl>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => field.onChange(star)}
                              className={`text-lg ${field.value >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <FormField control={form.control} name="availabledays" render={({ field }) => (
            <FormItem>
              <FormLabel>Disponibilidade de dias</FormLabel>
              <FormControl>
                <div className="grid grid-cols-4 gap-2">
                  {weekDays.map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded border text-sm ${
                        field.value?.includes(day)
                          ? 'bg-green-100 border-green-400'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" className="w-full font-semibold text-white" disabled={loading}>
            {loading ? 'Carregando...' : recreadorId ? 'Atualizar Recreador' : 'Cadastrar Recreador'}
          </Button>
        </form>
      </Form>
    </>
  )
}
