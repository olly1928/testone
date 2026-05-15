import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { BoxFitItem } from '../types/database'

export function useBoxFit() {
  const [boxFit, setBoxFit] = useState<BoxFitItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    supabase
      .from('box_fit')
      .select('*')
      .then(({ data, error }: { data: BoxFitItem[] | null; error: { message: string } | null }) => {
        if (error) setError(new Error(error.message))
        else setBoxFit(data ?? [])
        setLoading(false)
      })
  }, [])

  return { boxFit, loading, error }
}
