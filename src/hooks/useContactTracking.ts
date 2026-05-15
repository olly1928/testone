import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ContactTracking, RelationshipStatus } from '../types/database'

export function useContactTracking() {
  const [trackingMap, setTrackingMap] = useState<Record<string, ContactTracking>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('contact_tracking')
      .select('*')
      .then(({ data }: { data: ContactTracking[] | null }) => {
        if (data) {
          const map: Record<string, ContactTracking> = {}
          for (const row of data) map[row.executive_id] = row
          setTrackingMap(map)
        }
        setLoading(false)
      })

    const channel = supabase
      .channel('contact_tracking_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact_tracking' },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new as unknown as ContactTracking
          setTrackingMap((prev) => ({ ...prev, [row.executive_id]: row }))
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  const upsertContact = useCallback(
    async (
      executive_id: string,
      patch: { relationship_status?: RelationshipStatus; notes?: string },
    ) => {
      const { error } = await supabase.from('contact_tracking').upsert(
        {
          executive_id,
          ...patch,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'executive_id' },
      )
      return error
    },
    [],
  )

  return { trackingMap, loading, upsertContact }
}
