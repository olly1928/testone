import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Segment } from '../types/database'

export function useSegments() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    supabase
      .from('segments')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) setError(new Error(error.message))
        else setSegments(data ?? [])
        setLoading(false)
      })
  }, [])

  return { segments, loading, error }
}
