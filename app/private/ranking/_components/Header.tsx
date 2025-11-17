'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useRankingStore } from './store'
import { useState } from 'react'

export function Header() {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleSearch,
    loading,
    clearRankingPeriod,
  } = useRankingStore()
  const [clearing, setClearing] = useState(false)
  const [confirmChecked, setConfirmChecked] = useState(false)

  const handleClearPeriod = async () => {
    if (!confirm(`Tem certeza que deseja deletar todos os pontos de ranking de ${startDate} a ${endDate}? Esta ação não pode ser desfeita.`)) {
      return
    }
    setClearing(true)
    await clearRankingPeriod()
    setClearing(false)
    setConfirmChecked(false)
    await handleSearch()
  }

  return (
    <header>
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Ranking Trimestral</h1>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">De</label>
          <Input type="date" className="w-36" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <label className="text-sm font-medium">Até</label>
          <Input type="date" className="w-36" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button onClick={handleSearch} disabled={loading} variant="default">
            Buscar
          </Button>
          <div className="flex items-center gap-2">
            <Checkbox id="confirmClear" checked={confirmChecked} onCheckedChange={(v: boolean) => setConfirmChecked(Boolean(v))} />
            <label htmlFor="confirmClear" className="text-sm">limpar</label>
            {confirmChecked && (
              <Button onClick={handleClearPeriod} disabled={clearing || loading} variant="destructive" size="sm">
                {clearing ? 'Limpando...' : 'Limpar período'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
