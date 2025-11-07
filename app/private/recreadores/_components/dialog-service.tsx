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

import { useDialogRecreatorForm, DialogRecreatorFormData } from './dialog-recreator-form'
import { createRecreator } from '../_actions/create-recreator'
import { updateRecreator } from '../_actions/update'

interface DialogServiceProps {
  closeModal: () => void
  recreadorId?: string
  initialValues?: DialogRecreatorFormData
}

const weekDays = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
const specialties = ['palhaço', 'animador', 'pintura facial'] as const

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
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Recreador</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="specialty" render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidade</FormLabel>
              <FormControl>
                <select {...field} className="w-full border rounded px-3 py-2">
                  {specialties.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="specialtylevel" render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidade nível</FormLabel>
              <FormControl>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => field.onChange(star)}
                      className={`text-xl ${field.value >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="rg" render={({ field }) => (
            <FormItem>
              <FormLabel>RG</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="cpf" render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl><Input {...field} /></FormControl>
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
