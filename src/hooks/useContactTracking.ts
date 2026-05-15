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
      .channel(`contact_tracking_${Math.random().toString(36).slice(2, 9)}`)
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
      setTrackingMap((prev) => {
        const existing = prev[executive_id]
        const optimistic: ContactTracking = {
          id: existing?.id ?? '',
          executive_id,
          relationship_status: patch.relationship_status ?? existing?.relationship_status ?? 'No contact',
          notes: patch.notes !== undefined ? patch.notes : (existing?.notes ?? null),
          updated_at: new Date().toISOString(),
        }
        return { ...prev, [executive_id]: optimistic }
      })
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
