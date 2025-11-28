'use client'

import dynamic from 'next/dynamic'
import type { Recreator } from './services-list'

const RecreatorList = dynamic(
  () => import('./services-list').then(mod => mod.RecreatorList),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 text-muted-foreground">Carregando recreadores...</div>
    ),
  }
)

interface RecreadoresContentProps {
  recreadores: Recreator[]
}

export function RecreadoresContent({ recreadores }: RecreadoresContentProps) {
  return <RecreatorList recreadores={recreadores} />
}
