import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { TimelyOpener } from '../types/database'

export function useTimelyOpeners() {
  const [timelyOpeners, setTimelyOpeners] = useState<TimelyOpener[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    supabase
      .from('timely_openers')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(new Error(error.message))
        else setTimelyOpeners(data ?? [])
        setLoading(false)
      })
  }, [])

  return { timelyOpeners, loading, error }
}
