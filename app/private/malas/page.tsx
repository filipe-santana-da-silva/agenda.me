'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MalaCard } from './malacard'
import { CreateMalaDialog } from './CreateMalaDialog'


interface Bag {
  id: string
  number: number
}

export default function MalasPage() {
  const [bags, setBags] = useState<Bag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBags()
  }, [])

  async function fetchBags() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('Bag')
      .select('id, number')
      .order('number', { ascending: true })

    if (data && !error) {
      setBags(data)
    }

    setLoading(false)
  }

  return (
    <main className="px-2 py-4 sm:px-6 sm:py-8">
      <h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center">Malas</h1>
      <div className="flex justify-center mb-4">
        <CreateMalaDialog onCreated={fetchBags} />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center">Carregando malas...</p>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {bags.map((bag) => (
            <MalaCard key={bag.id} bagId={bag.id} number={bag.number} />
          ))}
        </div>
      )}
    </main>
  )
}
