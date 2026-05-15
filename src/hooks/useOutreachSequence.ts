import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { OutreachSequenceItem } from '../types/database'

export function useOutreachSequence() {
  const [sequence, setSequence] = useState<OutreachSequenceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    supabase
      .from('outreach_sequence')
      .select('*')
      .order('order_index')
      .then(({ data, error }) => {
        if (error) setError(new Error(error.message))
        else setSequence(data ?? [])
        setLoading(false)
      })
  }, [])

  return { sequence, loading, error }
}
