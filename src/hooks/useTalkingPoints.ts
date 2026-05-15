import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { TalkingPoint } from '../types/database'

export function useTalkingPoints() {
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    supabase
      .from('talking_points')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(new Error(error.message))
        else setTalkingPoints(data ?? [])
        setLoading(false)
      })
  }, [])

  return { talkingPoints, loading, error }
}
