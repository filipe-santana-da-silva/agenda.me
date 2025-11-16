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
    const supabase = createClient()
    set({ loading: true })

    const { startDate, endDate } = get()

    // Convert dates to ISO format with proper timezone handling
    // Start of startDate (00:00:00 UTC)
    const startDateTime = new Date(`${startDate}T00:00:00Z`).toISOString()
    // End of endDate (23:59:59 UTC)
    const endDateTime = new Date(`${endDate}T23:59:59.999Z`).toISOString()

    // debug info for troubleshooting
    // eslint-disable-next-line no-console
    console.debug('[ranking] fetch with range', { startDate, endDate, startDateTime, endDateTime })

    let { data, error } = await supabase
      .from('RankingEventDetail')
      .select('pointsawarded, recreatorid, recreator:recreatorid (name)')
      .gte('createdat', startDateTime)
      .lte('createdat', endDateTime)
      .order('createdat', { ascending: false })

    // debug info for troubleshooting - will appear in browser console
    // eslint-disable-next-line no-console
    console.debug('[ranking] fetch result', { dataLength: data?.length ?? 0, error, data })

    if (!data || error) {
      // eslint-disable-next-line no-console
      console.error('[ranking] fetch failed or returned no data', { error, startDate, endDate })
      set({ rankings: [], loading: false })
      return
    }

    const grouped = (data as any[]).reduce((acc, curr) => {
      const id = curr.recreatorid
      const name = Array.isArray(curr.recreator)
        ? curr.recreator[0]?.name
        : curr.recreator?.name

      if (!acc[id]) {
        acc[id] = { recreatorid: id, name, points: 0 }
      }

      acc[id].points += curr.pointsawarded
      return acc
    }, {} as Record<string, RankingEntry>)

    const sorted: RankingEntry[] = Object.values(grouped as Record<string, RankingEntry>)
      .sort((a, b) => b.points - a.points)

    // write results back into the store and finish loading
    set({ rankings: sorted, loading: false })
  },
}))
