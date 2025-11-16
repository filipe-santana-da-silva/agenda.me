"use client"

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PlusIcon } from '@radix-ui/react-icons'
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  onCreated?: () => void
}

export function CreateMalaDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)

    const supabase = createClient()
    
    // Buscar o próximo número disponível
    const { data: existingBags } = await supabase
      .from('Bag')
      .select('number')
      .order('number', { ascending: false })
      .limit(1)
    
    const nextNumber = (existingBags?.[0]?.number ?? 0) + 1

    const { error } = await supabase
      .from('Bag')
      .insert({ name, number: nextNumber })

    if (!error) {
      setOpen(false)
      setName('')
      onCreated?.()
    } else {
      console.error('Erro ao criar mala:', error)
    }

    setLoading(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm" className="flex items-center gap-2">
            <PlusIcon />
            Nova Mala
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogTitle>Criar nova mala</DialogTitle>

          <div className="pt-2">
            <Input value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} placeholder="Nome da mala" />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={loading}>{loading ? 'Criando...' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
