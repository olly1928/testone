import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { SubDivisionTracking, PenetrationStatus } from '../types/database'

export function useSubDivisionTracking() {
  const [trackingMap, setTrackingMap] = useState<Record<string, SubDivisionTracking>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('subdivision_tracking')
      .select('*')
      .then(({ data }: { data: SubDivisionTracking[] | null }) => {
        if (data) {
          const map: Record<string, SubDivisionTracking> = {}
          for (const row of data) map[row.subdivision_id] = row
          setTrackingMap(map)
        }
        setLoading(false)
      })

    const channel = supabase
      .channel('subdivision_tracking_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subdivision_tracking' },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new as unknown as SubDivisionTracking
          setTrackingMap((prev) => ({ ...prev, [row.subdivision_id]: row }))
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  const upsertSubDivision = useCallback(
    async (subdivision_id: string, patch: { penetration_status?: PenetrationStatus }) => {
      const { error } = await supabase.from('subdivision_tracking').upsert(
        {
          subdivision_id,
          ...patch,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'subdivision_id' },
      )
      return error
    },
    [],
  )

  return { trackingMap, loading, upsertSubDivision }
}
