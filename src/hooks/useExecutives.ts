import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Executive } from '../types/database'

export function useExecutives() {
  const [executives, setExecutives] = useState<Executive[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    supabase
      .from('executives')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) setError(new Error(error.message))
        else setExecutives(data ?? [])
        setLoading(false)
      })
  }, [])

  return { executives, loading, error }
}
