import { Suspense } from 'react'
import { ConfirmPageContent } from './confirm-content'

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">Carregando...</p></div>}>
      <ConfirmPageContent />
    </Suspense>
  )
}
