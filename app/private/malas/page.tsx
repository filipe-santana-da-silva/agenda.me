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
    <main className="p-6">
      <h1 className="text-xl font-bold mb-6">Malas</h1>
      <CreateMalaDialog onCreated={fetchBags} />


      {loading ? (
        <p className="text-muted-foreground">Carregando malas...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bags.map((bag) => (
            <MalaCard key={bag.id} bagId={bag.id} number={bag.number} />
          ))}
        </div>
      )}
    </main>
  )
}
