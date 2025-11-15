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

    // normalize to include the full day window and force UTC (append Z)
    // This avoids timezone mismatch where createdat is stored as ISO with Z
    const startDateTime = `${startDate}T00:00:00Z`
    const endDateTime = `${endDate}T23:59:59Z`

    // try fetching with date-time filters first
    let { data, error } = await supabase
      .from('RankingEventDetail')
      .select('pointsawarded, recreatorid, recreator:recreatorid (name)')
      .gte('createdat', startDateTime)
      .lte('createdat', endDateTime)

    // debug info for troubleshooting - will appear in browser console
    // (helps detect RLS/permission errors or date range mismatches)
    // eslint-disable-next-line no-console
    console.debug('[ranking] fetch with range', { startDate, endDate, startDateTime, endDateTime, dataLength: data?.length ?? 0, error })

    // NOTE: do NOT fallback to a fetch without date filters when the range returns
    // an empty array. Returning empty results is expected for a date window with
    // no events. Only treat real errors by aborting and showing no results.

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
