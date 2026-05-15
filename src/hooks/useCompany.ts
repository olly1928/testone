import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Company } from '../types/database'

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    supabase
      .from('companies')
      .select('*')
      .limit(1)
      .single()
      .then(({ data, error }: { data: Company | null; error: { message: string } | null }) => {
        if (error) setError(new Error(error.message))
        else setCompany(data)
        setLoading(false)
      })
  }, [])

  return { company, loading, error }
}
