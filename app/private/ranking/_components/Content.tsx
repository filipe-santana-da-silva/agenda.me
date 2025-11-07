'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { useRankingStore } from './store'
import { createClient } from '@/utils/supabase/client'

interface RankingEntry {
  recreatorid: string
  name: string
  points: number
}

export function Content() {
  const {
    rankings,
    setRankings,
    startDate,
    endDate,
    loading,
    setLoading,
  } = useRankingStore()

  useEffect(() => {
    handleSearch()
  }, [])

  async function handleSearch() {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('RankingEventDetail')
      .select('pointsawarded, recreatorid, recreator:recreatorid (name)')
      .gte('createdat', startDate)
      .lte('createdat', endDate)

    if (!data || error) {
      setRankings([])
      setLoading(false)
      return
    }

    const grouped = (data as {
      recreatorid: string
      pointsawarded: number
      recreator: { name: string } | { name: string }[]
    }[]).reduce((acc, curr) => {
      const id = curr.recreatorid
      const name = Array.isArray(curr.recreator)
        ? curr.recreator[0]?.name
        : curr.recreator?.name

      if (!acc[id]) {
        acc[id] = { recreatorid: id, name, points: 0 }
      }

      acc[id].points += curr.pointsawarded
      return acc
    }, {} as Record<string, RankingEntry>)

    const sorted: RankingEntry[] = Object.values(grouped).sort(
      (a, b) => b.points - a.points
    )

    setRankings(sorted)
    setLoading(false)
  }

  const medalIcons = ['/medalha-ouro.svg', '/medalha-prata.svg', '/medalha-bronze.svg']

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Resultado Trimestral</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4">
        <Image src="/rankings.svg" alt="Rankings" width={169} height={169} />

        <section className="flex flex-col items-start w-full gap-6">
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
