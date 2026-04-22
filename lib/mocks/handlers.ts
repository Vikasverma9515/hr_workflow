import { http, HttpResponse } from 'msw'
import { MOCK_AUTOMATIONS } from './data/automations'
import { simulateWorkflow } from './data/simulate'
import type { SimulateRequest } from '@/lib/types/api'

export const handlers = [
  http.get('/api/automations', () => {
    return HttpResponse.json(MOCK_AUTOMATIONS)
  }),

  http.post('/api/simulate', async ({ request }) => {
    const body = await request.json() as SimulateRequest
    const result = simulateWorkflow(body)
    return HttpResponse.json(result)
  }),
]
