import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Department } from '../types/database'

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    supabase
      .from('departments')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) setError(new Error(error.message))
        else setDepartments(data ?? [])
        setLoading(false)
      })
  }, [])

  return { departments, loading, error }
}
