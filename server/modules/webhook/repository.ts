import type { CapturedRequest, WebhookMetadata } from '@shared/modules/webhook/types'
import { logger } from '@shared/utils/logger'
import { computeTtlInSeconds, PAGE_SIZE, RATE_LIMIT_WINDOW_SECONDS } from './logic'

export async function findWebhook(env: Env, id: string): Promise<WebhookMetadata | null> {
  try {
    const data = await env.KV.get(`webhook:${id}`)
    return data ? (JSON.parse(data) as WebhookMetadata) : null
  } catch (error: unknown) {
    logger.error('Failed when loading webhook from keystore.', error)
    return null
  }
}

export async function saveWebhook(webhook: WebhookMetadata, env: Env): Promise<WebhookMetadata> {
  await env.KV.put(`webhook:${webhook.id}`, JSON.stringify(webhook), { expirationTtl: webhook.ttlInSeconds })
  return webhook
}

export async function findPageOfWebhookRequests(env: Env, id: string, limit: number, cursor: string | null) {
  try {
    const result = await env.KV.list({ prefix: `webhook:${id}:req:`, limit, cursor })
    const values = await Promise.all(result.keys.map(key => env.KV.get(key.name)))
    const requests = values.filter((data): data is string => data !== null).map(data => JSON.parse(data) as CapturedRequest)
    return {
      requests: requests,
      nextCursor: result.list_complete ? null : result.cursor,
      hasMore: !result.list_complete,
    }
  } catch (error: unknown) {
    logger.error('Error when loading %d webhook requests (cursor="%s") for webhook with id="%s"', limit, cursor, id, error)
    throw error
  }
}

export async function saveWebhookRequest(request: CapturedRequest, webhook: WebhookMetadata, env: Env): Promise<void> {
  const ttlInSeconds = computeTtlInSeconds(env)

  // Reverse the timestamp so that lexicographic order in KV equals newest-first.
  // This lets list() + its native cursor drive pagination without any reversal.
  const reversedTs = (9999999999999 - new Date(request.timestamp).getTime()).toString().padStart(13, '0')
  await env.KV.put(`webhook:${webhook.id}:req:${reversedTs}:${request.id}`, JSON.stringify(request), {
    expirationTtl: ttlInSeconds,
  })

  // Refresh the metadata TTL so the webhook stays alive as long as it keeps receiving traffic.
  await env.KV.put(`webhook:${webhook.id}`, JSON.stringify(webhook), { expirationTtl: ttlInSeconds })
}

const DELETION_CHUNK_SIZE = 25

export async function deleteWebhook(env: Env, id: string): Promise<void> {
  let cursor: string | undefined
  let isComplete = false
  while (!isComplete) {
    const result = await env.KV.list<unknown>({ prefix: `webhook:${id}:req:`, cursor, limit: DELETION_CHUNK_SIZE })
    await Promise.all(result.keys.map(key => env.KV.delete(key.name)))
    isComplete = result.list_complete
    cursor = result.list_complete ? undefined : result.cursor
  }
  await env.KV.delete(`webhook:${id}`)
}

export function computePage(providedLimit: string | null, providedCursor: string | null, env: Env) {
  return {
    limit: Math.min(Math.max(1, Number(providedLimit) || Number(env.PAGE_SIZE) || PAGE_SIZE), 100),
    cursor: providedCursor ?? null,
  }
}

export async function incrementNumberOfCallsFor(env: Env, webhookId: string, day: Date) {
  const date = day.toISOString().slice(0, 10)
  const rateKey = `webhook:${webhookId}:rate:${date}`
  const countData = await env.KV.get(rateKey)
  const newCount = countData ? Number(countData) + 1 : 1
  const ttlInSeconds = Number(env.RATE_LIMIT_WINDOW_SECONDS) || RATE_LIMIT_WINDOW_SECONDS
  await env.KV.put(rateKey, String(newCount), { expirationTtl: ttlInSeconds })
  return newCount
}
