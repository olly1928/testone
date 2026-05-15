import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { RiskFactor } from '../types/database'

export function useRiskFactors() {
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    supabase
      .from('risk_factors')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(new Error(error.message))
        else setRiskFactors(data ?? [])
        setLoading(false)
      })
  }, [])

  return { riskFactors, loading, error }
}
