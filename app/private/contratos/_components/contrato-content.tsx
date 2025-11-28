'use client'

import dynamic from 'next/dynamic'

const Content = dynamic(() => import('./Content').then(mod => mod.Content), {
  ssr: false,
  loading: () => <div className="p-4 text-muted-foreground">Carregando contratos...</div>
})

const Header = dynamic(() => import('./Header').then(mod => mod.Header), {
  ssr: false,
  loading: () => <div className="p-4 text-muted-foreground">Carregando...</div>
})

export function ContratoContent() {
  return (
    <div>
      <Header />
      <Content />
    </div>
  )
}
