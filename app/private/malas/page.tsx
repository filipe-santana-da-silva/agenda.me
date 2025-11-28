'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'

const MalaCard = dynamic(() => import('./malacard').then(mod => mod.MalaCard), { 
  ssr: false,
  loading: () => <div className="p-2 text-sm text-muted-foreground">Carregando...</div> 
})

const CreateMalaDialog = dynamic(() => import('./CreateMalaDialog').then(mod => mod.CreateMalaDialog), { 
  ssr: false,
  loading: () => <div className="p-2 text-sm text-muted-foreground">Carregando...</div> 
})


interface Bag {
  id: string
  number: number
  name?: string
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
      .select('id, number, name')
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
            <MalaCard key={bag.id} bagId={bag.id} number={bag.number} name={bag.name} />
          ))}
        </div>
      )}
    </main>
  )
}
