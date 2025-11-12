'use client'

import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useDialogContractorForm, DialogContractorFormData } from './dialog-contractor-form'
import { createContractor } from '../_actions/create-contractor'
import { updateContractor } from '../_actions/update-contractor'

import { formatDocumentValue } from '@/utils/formartDocument'

interface DialogServiceProps {
  closeModal: () => void
  contractorId?: string
  initialValues?: DialogContractorFormData
  onCreate?: (newContractor: any) => void
}

export function DialogService({ closeModal, initialValues, contractorId, onCreate }: DialogServiceProps) {
  const [loading, setLoading] = useState(false)
  const form = useDialogContractorForm({ initialValues })
  const documentType = form.watch('documenttype')
  const personType = form.watch('personType')

  useEffect(() => {
    // when switching to juridica, prefer CNPJ and clear child-specific fields
    if (personType === 'juridica') {
      form.setValue('documenttype', 'CNPJ')
      form.setValue('childname', '')
      form.setValue('maritalstatus', '')
      form.setValue('profession', '')
    }
    // when switching to fisica, ensure document type has a sensible default
    if (personType === 'fisica' && (form.getValues().documenttype === '' || form.getValues().documenttype === 'CNPJ')) {
      form.setValue('documenttype', 'CPF')
    }
  }, [personType])

  async function onSubmit(values: DialogContractorFormData) {
    setLoading(true)

    if (contractorId) {
      const response = await updateContractor({ contractorId, ...values })
      setLoading(false)

      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success(response.data)
      handleCloseModal()
      return
    }

    const response = await createContractor(values)
    setLoading(false)

    if (response.error) {
      toast.error(response.error)
      return
    }

    toast.success('Contratante cadastrado com sucesso!')
    onCreate?.(response.data)
    handleCloseModal()
  }

  function handleCloseModal() {
    form.reset()
    closeModal()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{contractorId ? 'Editar Contratante' : 'Adicionar Contratante'}</DialogTitle>
        <DialogDescription>Preencha os dados do contratante.</DialogDescription>
      </DialogHeader>

      <Form {...(form as any)}>
        <form className="space-y-4" onSubmit={(form as any).handleSubmit(onSubmit as any)}>
          <FormField
            control={form.control}
            name="personType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de pessoa</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fisica">Pessoa Física</SelectItem>
                      <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{personType === 'juridica' ? 'Nome da empresa / Razão social' : 'Nome do responsável'}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={personType === 'juridica' ? 'Ex: Empresa ABC Ltda' : 'Ex: Fernanda'} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {personType === 'fisica' && (
            <FormField
              control={form.control}
              name="childname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da criança</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Ana Clara" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="(11) 91234-5678" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Rua das Flores, 123" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {personType === 'fisica' && (
            <>
              <FormField
                control={form.control}
                name="maritalstatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Civil</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full border rounded px-3 py-2">
                        <option value="">-- selecione --</option>
                        <option value="solteiro">Solteiro(a)</option>
                        <option value="casado">Casado(a)</option>
                        <option value="separado">Separado(a)</option>
                        <option value="divorciado">Divorciado(a)</option>
                        <option value="viuvo">Viúvo(a)</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissão</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Advogado, Médico, Autônomo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="documenttype"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de documento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de documento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CPF">CPF</SelectItem>
                    <SelectItem value="RG">RG</SelectItem>
                    <SelectItem value="CNPJ">CNPJ</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentvalue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do documento</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={
                      documentType === 'CPF'
                        ? 'Ex: 123.456.789-00'
                        : documentType === 'CNPJ'
                        ? 'Ex: 12.345.678/0001-99'
                        : 'Ex: 12.345.678-9'
                    }
                    value={formatDocumentValue(documentType, field.value)}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full font-semibold text-white" disabled={loading}>
            {loading ? 'Salvando...' : contractorId ? 'Atualizar Contratante' : 'Cadastrar Contratante'}
          </Button>
        </form>
      </Form>
    </>
  )
}
