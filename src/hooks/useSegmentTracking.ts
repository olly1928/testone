import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { SegmentTracking, PenetrationStatus } from '../types/database'

export function useSegmentTracking() {
  const [trackingMap, setTrackingMap] = useState<Record<string, SegmentTracking>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('segment_tracking')
      .select('*')
      .then(({ data }: { data: SegmentTracking[] | null }) => {
        if (data) {
          const map: Record<string, SegmentTracking> = {}
          for (const row of data) map[row.segment_id] = row
          setTrackingMap(map)
        }
        setLoading(false)
      })

    const channel = supabase
      .channel(`segment_tracking_${Math.random().toString(36).slice(2, 9)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'segment_tracking' },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new as unknown as SegmentTracking
          setTrackingMap((prev) => ({ ...prev, [row.segment_id]: row }))
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  const upsertSegment = useCallback(
    async (segment_id: string, patch: { penetration_status?: PenetrationStatus }) => {
      const { error } = await supabase.from('segment_tracking').upsert(
        {
          segment_id,
          ...patch,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'segment_id' },
      )
      return error
    },
    [],
  )

  return { trackingMap, loading, upsertSegment }
}
