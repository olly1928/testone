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
      .then(({ data }) => {
        if (data) {
          const map: Record<string, DepartmentTracking> = {}
          for (const row of data) map[row.department_id] = row
          setTrackingMap(map)
        }
        setLoading(false)
      })

    const channel = supabase
      .channel('department_tracking_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'department_tracking' },
        (payload) => {
          const row = payload.new as DepartmentTracking
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
