import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { SubDivision } from '../types/database'

export function useSubDivisions() {
  const [subDivisions, setSubDivisions] = useState<SubDivision[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    supabase
      .from('sub_divisions')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) setError(new Error(error.message))
        else setSubDivisions(data ?? [])
        setLoading(false)
      })
  }, [])

  return { subDivisions, loading, error }
}
