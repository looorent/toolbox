import { logger } from '@shared/utils/logger'
import { buildWebhook, buildWebhookRequest, checkRateLimit, RATE_LIMIT_PER_DAY, scrubHeaders, secondsUntilMidnightUtc } from './logic'
import {
  computePage,
  deleteWebhook as deleteWebhookFromKeystore,
  findPageOfWebhookRequests,
  findWebhook,
  saveWebhook,
  saveWebhookRequest,
} from './repository'

export async function createWebhook(env: Env): Promise<Response> {
  const webhook = await saveWebhook(buildWebhook(env), env)
  logger.info('[POST Webhook] Created with id "%s"', webhook.id)
  return allowResponse(webhook, 201)
}

export async function getWebhook(env: Env, id: string): Promise<Response> {
  const webhook = await findWebhook(env, id)
  if (webhook) {
    logger.info('[GET Webhook] Found with id "%s"', id)
    return allowResponse(webhook)
  } else {
    logger.warn('[GET Webhook] Not Found with id "%s"', id)
    return allowResponse({ error: 'webhook_not_found' }, 404)
  }
}

export async function listWebhookRequests(env: Env, id: string, url: URL): Promise<Response> {
  const webhook = await findWebhook(env, id)
  if (webhook) {
    const { limit, cursor } = computePage(url.searchParams.get('limit'), url.searchParams.get('cursor'), env)
    const { requests, nextCursor, hasMore } = await findPageOfWebhookRequests(env, webhook.id, limit, cursor)
    return allowResponse({
      requests: requests.map(request => ({ ...request, headers: scrubHeaders(request.headers) })),
      nextCursor: nextCursor,
      hasMore: hasMore,
    })
  } else {
    logger.warn('[GET Webhook requests] Not Found with id "%s"', id)
    return allowResponse({ error: 'webhook_not_found' }, 404)
  }
}

export async function deleteWebhook(env: Env, id: string): Promise<Response> {
  const webhook = await findWebhook(env, id)
  if (webhook) {
    await deleteWebhookFromKeystore(env, id)
    logger.info('[DELETE Webhook] Deleted webhook with id "%s"', id)
    return allowResponse({ deleted: true })
  } else {
    logger.warn('[DELETE Webhook requests] Not Found with id "%s"', id)
    return allowResponse({ error: 'webhook_not_found' }, 404)
  }
}

export async function captureWebhookRequest(request: Request, env: Env, webhookId: string, url: URL): Promise<Response> {
  const webhook = await findWebhook(env, webhookId)
  if (webhook) {
    const dailyLimit = Number(env.WEBHOOK_RATE_LIMIT_PER_DAY) || RATE_LIMIT_PER_DAY
    const now = new Date()
    const isAllowed = await checkRateLimit(env, webhookId, now, dailyLimit)
    if (isAllowed) {
      const captured = await buildWebhookRequest(request, url)
      await saveWebhookRequest(captured, webhook, env)
      logger.info('[CAPTURE Webhook requests] Saved with id="%s" for webhook with id="%s"', captured.id, webhook.id)
      return allowResponse({ received: true, id: captured.id })
    } else {
      logger.warn('[CAPTURE Webhook requests] Rate limit exceeded for webhook with id="%s"', webhook.id)
      return allowResponse({ error: 'rate_limit_exceeded', retryAfter: secondsUntilMidnightUtc(now) }, 429)
    }
  } else {
    logger.warn('[CAPTURE Webhook requests] Webhook not found with id="%s"', webhookId)
    return allowResponse({ error: 'webhook_not_found' }, 404)
  }
}

function allowResponse(payload: unknown, status = 200): Response {
  return Response.json(payload, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  })
}
