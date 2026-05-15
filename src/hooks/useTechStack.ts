import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { TechStackItem } from '../types/database'

export function useTechStack() {
  const [techStack, setTechStack] = useState<TechStackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    supabase
      .from('tech_stack')
      .select('*')
      .order('category')
      .then(({ data, error }: { data: TechStackItem[] | null; error: { message: string } | null }) => {
        if (error) setError(new Error(error.message))
        else setTechStack(data ?? [])
        setLoading(false)
      })
  }, [])

  return { techStack, loading, error }
}
