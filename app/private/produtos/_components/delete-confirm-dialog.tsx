'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type?: 'product' | 'category'
  itemName: string
  onConfirm: () => void
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  type,
  itemName,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const typeLabel = type === 'product' ? 'Produto' : 'Categoria'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover {typeLabel}</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja remover o {typeLabel.toLowerCase()} <strong>{itemName}</strong>? 
            {type === 'category' && ' Os produtos desta categoria não serão deletados.'}
            {type === 'product' && ' Esta ação não pode ser desfeita.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
          >
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
