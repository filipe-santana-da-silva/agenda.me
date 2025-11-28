'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRankingStore } from './store'

export function Header() {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleSearch,
    loading
  } = useRankingStore()
  
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
        </div>
      </div>
    </header>
  )
}
