'use client'

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { useRankingStore } from './store'
import { Header } from './Header'

interface RankingEntry {
  recreatorid: string
  name: string
  points: number
}

export function Content() {
  const { rankings, handleSearch, startDate, endDate, loading, setStartDate, setEndDate } = useRankingStore()

  useEffect(() => {
    // use the centralized store fetch so logic stays in one place
    handleSearch()
  }, [handleSearch, startDate, endDate])

  const medalIcons = ['/medalha-ouro.svg', '/medalha-prata.svg', '/medalha-bronze.svg']

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4">
        <Image src="/rankings.svg" alt="Rankings" width={169} height={169} />

        <section className="flex flex-col items-start w-full gap-6">
          {!loading && rankings.length === 0 && (
            <div className="text-center text-muted-foreground">Nenhum resultado encontrado para o período selecionado.</div>
          )}

          {rankings.slice(0, 3).map((r, index) => (
            <div key={r.recreatorid} className="flex items-center">
              <Image src={medalIcons[index]} alt={`Medalha ${index}`} width={50} height={50} />
              <h1 className="font-semibold text-xl ml-6">{index + 1}º Lugar: {r.name}</h1>
              <h1 className="font-semibold text-xl ml-6">{r.points} pontos</h1>
              <div className="flex ml-8">
                {Array.from({ length: Math.round(r.points / 10) }).map((_, i) => (
                  <Image
                    key={`estrela-${index}-${i}`}
                    src="/estrela.svg"
                    alt="estrela"
                    width={20}
                    height={20}
                    className="mr-1"
                  />
                ))}
              </div>
            </div>
          ))}

          {rankings.slice(3).map((r, index) => (
            <div key={r.recreatorid} className="flex items-center">
              <span className="font-semibold text-lg w-32">{index + 4}º Lugar: {r.name}</span>
              <span className="text-muted-foreground ml-4">{r.points} pontos</span>
              <div className="flex ml-6">
                {Array.from({ length: Math.round(r.points / 10) }).map((_, i) => (
                  <Image
                    key={`estrela-extra-${index}-${i}`}
                    src="/estrela.svg"
                    alt="estrela"
                    width={20}
                    height={20}
                    className="mr-1"
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      </CardContent>
    </Card>
  )
}
