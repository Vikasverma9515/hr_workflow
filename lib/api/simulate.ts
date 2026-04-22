import type { SimulateRequest, SimulateResponse } from '@/lib/types/api'

export async function postSimulate(request: SimulateRequest): Promise<SimulateResponse> {
  const res = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) throw new Error('Simulation request failed')
  return res.json()
}
