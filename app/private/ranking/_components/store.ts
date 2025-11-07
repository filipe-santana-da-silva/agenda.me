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
    const { data, error } = await supabase
      .from('RankingEventDetail')
      .select('pointsawarded, recreatorid, recreator:recreatorid (name)')
      .gte('createdat', startDate)
      .lte('createdat', endDate)

    if (!data || error) {
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
  .sort((a, b) => b.points - a.points)}
}))
