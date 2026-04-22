'use client'

import { useState } from 'react'
import { postSimulate } from '@/lib/api/simulate'
import type { SimulateRequest, SimulateResponse } from '@/lib/types/api'

export function useSimulate() {
  const [result, setResult] = useState<SimulateResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function simulate(request: SimulateRequest) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await postSimulate(request)
      setResult(res)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError(null)
  }

  return { simulate, result, loading, error, reset }
}
