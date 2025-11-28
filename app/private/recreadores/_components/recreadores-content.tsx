'use client'

import dynamic from 'next/dynamic'

const RecreatorList = dynamic(() => import('./services-list').then(mod => mod.RecreatorList), {
  ssr: false,
  loading: () => <div className="p-4 text-muted-foreground">Carregando recreadores...</div>
})

interface Recreator {
  id: string
  name: string
  // Add other fields as needed
}

interface RecreadoresContentProps {
  recreadores: Recreator[]
}

export function RecreadoresContent({ recreadores }: RecreadoresContentProps) {
  return <RecreatorList recreadores={recreadores} />
}
