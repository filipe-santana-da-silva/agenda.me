'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, MessageSquare, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/SimpleAuthContext'

interface Ticket {
  id: string
  user_id?: string
  title: string
  category: string
  description: string
  status: string
  created_at: string
  updated_at: string
}

const categoriaLabels: Record<string, string> = {
  problema: 'Problema',
  duvida: 'Dúvida',
  sugestao: 'Sugestão',
  outro: 'Outro'
}

const statusLabels: Record<string, string> = {
  aberto: 'Aberto',
  'em andamento': 'Em Andamento',
  resolvido: 'Resolvido'
}

const statusColors: Record<string, string> = {
  aberto: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'em andamento': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  resolvido: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
}

const categoriaColors: Record<string, string> = {
  problema: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  sugestao: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  duvida: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  outro: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
}

export function SuportePage() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="max-w-md w-full dark:bg-slate-800 dark:border-slate-700 p-6 text-center">
        <CardHeader>
          <CardTitle>Suporte de TI</CardTitle>
          <CardDescription>Para atendimento, acesse o suporte abaixo:</CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href="https://suporte.seusite.com" // Altere para o link real
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Acessar Suporte de TI
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
