'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Header } from './_components/Header'
import { Content } from './_components/Content'

export default async function RankingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await (await supabase).auth.getUser()

  if (!user?.id) {
    redirect('/')
  }

  return (
    <Suspense fallback={<div className="p-4 text-muted-foreground">Carregando ranking...</div>}>
      <Header />
      <Content />
    </Suspense>
  )
}
