import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { GeographyRegion } from '../types/database'

export function useGeographyRegions() {
  const [regions, setRegions] = useState<GeographyRegion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    supabase
      .from('geography_regions')
      .select('*')
      .order('revenue_bn', { ascending: false })
      .then(({ data, error }: { data: GeographyRegion[] | null; error: { message: string } | null }) => {
        if (error) setError(new Error(error.message))
        else setRegions(data ?? [])
        setLoading(false)
      })
  }, [])

  return { regions, loading, error }
}
