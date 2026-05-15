import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { SupervisoryBoardMember } from '../types/database'

export function useSupervisoryBoard() {
  const [members, setMembers] = useState<SupervisoryBoardMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    supabase
      .from('supervisory_board')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) setError(new Error(error.message))
        else setMembers(data ?? [])
        setLoading(false)
      })
  }, [])

  return { members, loading, error }
}
