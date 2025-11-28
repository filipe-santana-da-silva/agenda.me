'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { RankingContent } from './_components/ranking-content'

export default async function RankingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await (await supabase).auth.getUser()

  if (!user?.id) {
    redirect('/')
  }

  return <RankingContent />
}
