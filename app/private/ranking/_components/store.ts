import { create } from 'zustand'
import { createClient } from '@/utils/supabase/client'

interface RankingEntry {
  recreatorid: string
  name: string
  points: number
}

interface RankingStore {
  startDate: string
  endDate: string
  setStartDate: (value: string) => void
  setEndDate: (value: string) => void
  rankings: RankingEntry[]
  setRankings: (data: RankingEntry[]) => void
  loading: boolean
  setLoading: (value: boolean) => void
  handleSearch: () => void
  clearRankingPeriod: () => Promise<void>
}

export const useRankingStore = create<RankingStore>((set, get) => ({
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),

  setStartDate: (value) => set({ startDate: value }),
  setEndDate: (value) => set({ endDate: value }),

  rankings: [],
  setRankings: (data) => set({ rankings: data }),

  loading: false,
  setLoading: (value) => set({ loading: value }),

  handleSearch: async () => {
    set({ loading: true })
    const { startDate, endDate } = get()

    // debug
    // eslint-disable-next-line no-console
    console.debug('[ranking] aggregate request', { startDate, endDate })

    try {
      const resp = await fetch('/api/ranking/aggregate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ startDate: startDate, endDate: endDate }),
      })

      if (!resp.ok) {
        const e = await resp.json().catch(() => ({ error: 'unknown' }))
        // eslint-disable-next-line no-console
        console.error('[ranking] aggregate api error', e)
        set({ rankings: [], loading: false })
        return
      }

      const json = await resp.json()
      const rows: Array<any> = Array.isArray(json?.data) ? json.data : []

      const entries: RankingEntry[] = rows.map((r) => ({ recreatorid: String(r.recreatorid), name: r.name ?? String(r.recreatorid), points: Number(r.points) || 0 }))

      // sort descending
      entries.sort((a, b) => b.points - a.points)

      set({ rankings: entries, loading: false })
      return
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ranking] aggregate fetch failed', err)
      set({ rankings: [], loading: false })
      return
    }
  },

  clearRankingPeriod: async () => {
    const supabase = createClient()
    const { startDate, endDate } = get()

    // Convert dates to ISO format
    const startDateTime = new Date(`${startDate}T00:00:00Z`).toISOString()
    const endDateTime = new Date(`${endDate}T23:59:59.999Z`).toISOString()

    // eslint-disable-next-line no-console
    console.log('[ranking] Clearing period:', { startDate, endDate, startDateTime, endDateTime })

    const { error } = await supabase
      .from('RankingEventDetail')
      .delete()
      .gte('createdat', startDateTime)
      .lte('createdat', endDateTime)

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[ranking] Error clearing period:', error)
      alert(`Erro ao limpar período: ${error.message}`)
    } else {
      // eslint-disable-next-line no-console
      console.log('[ranking] Period cleared successfully')
      alert('Período limpo com sucesso!')
      set({ rankings: [] })
    }
  },
}))
