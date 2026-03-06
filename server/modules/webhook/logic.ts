import type { CapturedHeader, CapturedRequest, HttpMethod, WebhookMetadata } from '@shared/modules/webhook/types'
import { incrementNumberOfCallsFor } from './repository'

export const RATE_LIMIT_WINDOW_SECONDS = 86_401 // ~24 h, intentionally slightly over a day boundary
export const RATE_LIMIT_PER_DAY = 10_000
export const PAGE_SIZE = 25

const TTL_SECONDS = 30 * 24 * 60 * 60
const SENSITIVE_HEADER_PATTERN = /authorization|cookie|token|api.?key|password|credential|bearer|private.?key|access.?key|secret/i

export function scrubHeaders(headers: CapturedHeader[]): CapturedHeader[] {
  return headers.map(header => ({
    ...header,
    value: SENSITIVE_HEADER_PATTERN.test(header.name) ? '[redacted]' : header.value,
  }))
}

export async function checkRateLimit(env: Env, webhookId: string, day: Date, dailyLimit: number): Promise<boolean> {
  const count = await incrementNumberOfCallsFor(env, webhookId, day)
  return count <= dailyLimit
}

export function computeTtlInSeconds(env: Env): number {
  return Number(env.WEBHOOK_TTL_SECONDS) || TTL_SECONDS
}

export function buildWebhook(env: Env): WebhookMetadata {
  return {
    id: crypto.randomUUID(),
    ttlInSeconds: computeTtlInSeconds(env),
    createdAt: new Date().toISOString(),
  }
}

export async function buildWebhookRequest(request: Request, url: URL): Promise<CapturedRequest> {
  return {
    id: crypto.randomUUID(),
    method: request.method as HttpMethod,
    path: url.pathname,
    queryParams: Object.fromEntries(url.searchParams.entries()),
    headers: Array.from(request.headers.entries(), ([name, value]) => ({ name, value })),
    body: await parsePayload(request),
    contentType: request.headers.get('content-type'),
    timestamp: new Date().toISOString(),
    ip: request.headers.get('cf-connecting-ip'),
  }
}

export function secondsUntilMidnightUtc(now: Date): number {
  const midnight = new Date(now)
  midnight.setUTCHours(24, 0, 0, 0)
  return Math.ceil((midnight.getTime() - now.getTime()) / 1000)
}

async function parsePayload(request: Request): Promise<string | null> {
  try {
    const text = await request.text()
    return text || null
  } catch {
    return null
  }
}
