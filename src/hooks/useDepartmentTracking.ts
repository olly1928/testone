import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { DepartmentTracking, PenetrationStatus } from '../types/database'

export function useDepartmentTracking() {
  const [trackingMap, setTrackingMap] = useState<Record<string, DepartmentTracking>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('department_tracking')
      .select('*')
      .then(({ data }: { data: DepartmentTracking[] | null }) => {
        if (data) {
          const map: Record<string, DepartmentTracking> = {}
          for (const row of data) map[row.department_id] = row
          setTrackingMap(map)
        }
        setLoading(false)
      })

    const channel = supabase
      .channel(`department_tracking_${Math.random().toString(36).slice(2, 9)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'department_tracking' },
        (payload: { new: Record<string, unknown> }) => {
          const row = payload.new as unknown as DepartmentTracking
          setTrackingMap((prev) => ({ ...prev, [row.department_id]: row }))
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  const upsertDepartment = useCallback(
    async (department_id: string, patch: { penetration_status?: PenetrationStatus }) => {
      setTrackingMap((prev) => {
        const existing = prev[department_id]
        const optimistic: DepartmentTracking = {
          id: existing?.id ?? '',
          department_id,
          penetration_status: patch.penetration_status ?? existing?.penetration_status ?? 'Unmapped',
          updated_at: new Date().toISOString(),
        }
        return { ...prev, [department_id]: optimistic }
      })
      const { error } = await supabase.from('department_tracking').upsert(
        {
          department_id,
          ...patch,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'department_id' },
      )
      return error
    },
    [],
  )

  return { trackingMap, loading, upsertDepartment }
}
