import type { CapturedRequest, WebhookMetadata } from '@shared/modules/webhook/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  captureWebhookRequest,
  createWebhook as createWebhookHandler,
  deleteWebhook as deleteWebhookHandler,
  getWebhook,
  listWebhookRequests,
} from './handlers'
import {
  deleteWebhook as deleteWebhookFromKv,
  findPageOfWebhookRequests,
  findWebhook,
  incrementNumberOfCallsFor,
  saveWebhook,
  saveWebhookRequest,
} from './repository'

// Preserve computePage's real implementation so listWebhookRequests can parse URL params.
vi.mock('./repository', async () => {
  const actual = await vi.importActual<typeof import('./repository')>('./repository')
  return {
    ...actual,
    findWebhook: vi.fn(),
    saveWebhook: vi.fn(),
    saveWebhookRequest: vi.fn(),
    deleteWebhook: vi.fn(),
    findPageOfWebhookRequests: vi.fn(),
    incrementNumberOfCallsFor: vi.fn(),
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

function mockEnv(): Env {
  return {
    KV: {} as KVNamespace,
    WEBHOOK_TTL_SECONDS: '2592000',
    WEBHOOK_RATE_LIMIT_PER_DAY: '10000',
    RATE_LIMIT_WINDOW_SECONDS: '86401',
    PAGE_SIZE: '25',
  } as unknown as Env
}

function makeRequest(url = 'https://example.com/hooks/wh-test-123', init?: RequestInit) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"data":"test"}', ...init })
}

const WEBHOOK: WebhookMetadata = {
  id: 'wh-test-123',
  ttlInSeconds: 2592000,
  createdAt: '2024-01-01T00:00:00.000Z',
}

const CAPTURED_REQUEST: CapturedRequest = {
  id: 'req-1',
  method: 'POST',
  path: '/hooks/wh-test-123',
  queryParams: {},
  headers: [{ name: 'authorization', value: 'Bearer secret-token' }],
  body: null,
  contentType: null,
  timestamp: '2024-01-15T10:30:00.000Z',
  ip: null,
}

describe('createWebhook handler', () => {
  beforeEach(() => {
    vi.mocked(saveWebhook).mockImplementation(async webhook => webhook)
  })

  it('returns 201 with the new webhook', async () => {
    const response = await createWebhookHandler(mockEnv())

    expect(response.status).toBe(201)
    const body = (await response.json()) as WebhookMetadata
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(body.ttlInSeconds).toBe(2592000)
  })

  it('sets Access-Control-Allow-Origin: *', async () => {
    const response = await createWebhookHandler(mockEnv())
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })
})

describe('getWebhook handler', () => {
  it('returns 200 with the webhook metadata when found', async () => {
    vi.mocked(findWebhook).mockResolvedValue(WEBHOOK)

    const response = await getWebhook(mockEnv(), WEBHOOK.id)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(WEBHOOK)
  })

  it('returns 404 with webhook_not_found when the webhook does not exist', async () => {
    vi.mocked(findWebhook).mockResolvedValue(null)

    const response = await getWebhook(mockEnv(), 'nonexistent')

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'webhook_not_found' })
  })
})

describe('listWebhookRequests handler', () => {
  beforeEach(() => {
    vi.mocked(findWebhook).mockResolvedValue(WEBHOOK)
    vi.mocked(findPageOfWebhookRequests).mockResolvedValue({
      requests: [CAPTURED_REQUEST],
      nextCursor: null,
      hasMore: false,
    })
  })

  it('returns 200 with the paginated request list', async () => {
    const url = new URL('https://example.com/api/webhooks/wh-test-123/requests')

    const response = await listWebhookRequests(mockEnv(), WEBHOOK.id, url)

    expect(response.status).toBe(200)
    const body = (await response.json()) as { requests: CapturedRequest[]; hasMore: boolean }
    expect(body.hasMore).toBe(false)
    expect(body.requests).toHaveLength(1)
  })

  it('scrubs sensitive headers before returning them', async () => {
    const url = new URL('https://example.com/api/webhooks/wh-test-123/requests')

    const response = await listWebhookRequests(mockEnv(), WEBHOOK.id, url)

    const body = (await response.json()) as { requests: CapturedRequest[] }
    expect(body.requests[0].headers[0].value).toBe('[redacted]')
  })

  it('passes the cursor query parameter to the repository', async () => {
    const url = new URL('https://example.com/api/webhooks/wh-test-123/requests?cursor=page2')

    await listWebhookRequests(mockEnv(), WEBHOOK.id, url)

    expect(findPageOfWebhookRequests).toHaveBeenCalledWith(expect.anything(), WEBHOOK.id, expect.any(Number), 'page2')
  })

  it('returns 404 when the webhook does not exist', async () => {
    vi.mocked(findWebhook).mockResolvedValue(null)
    const url = new URL('https://example.com/api/webhooks/nonexistent/requests')

    const response = await listWebhookRequests(mockEnv(), 'nonexistent', url)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'webhook_not_found' })
  })
})

describe('deleteWebhook handler', () => {
  it('deletes the webhook and returns { deleted: true }', async () => {
    vi.mocked(findWebhook).mockResolvedValue(WEBHOOK)
    vi.mocked(deleteWebhookFromKv).mockResolvedValue(undefined)

    const response = await deleteWebhookHandler(mockEnv(), WEBHOOK.id)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ deleted: true })
    expect(deleteWebhookFromKv).toHaveBeenCalledWith(expect.anything(), WEBHOOK.id)
  })

  it('returns 404 when the webhook does not exist', async () => {
    vi.mocked(findWebhook).mockResolvedValue(null)

    const response = await deleteWebhookHandler(mockEnv(), 'nonexistent')

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'webhook_not_found' })
    expect(deleteWebhookFromKv).not.toHaveBeenCalled()
  })
})

describe('captureWebhookRequest handler', () => {
  const url = new URL('https://example.com/hooks/wh-test-123')

  beforeEach(() => {
    vi.mocked(saveWebhookRequest).mockResolvedValue(undefined)
  })

  it('captures the request and returns { received: true } when within rate limit', async () => {
    vi.mocked(findWebhook).mockResolvedValue(WEBHOOK)
    vi.mocked(incrementNumberOfCallsFor).mockResolvedValue(1)

    const response = await captureWebhookRequest(makeRequest(), mockEnv(), WEBHOOK.id, url)

    expect(response.status).toBe(200)
    const body = (await response.json()) as { received: boolean; id: string }
    expect(body.received).toBe(true)
    expect(body.id).toBeDefined()
    expect(saveWebhookRequest).toHaveBeenCalled()
  })

  it('returns 429 when the daily rate limit is exceeded', async () => {
    vi.mocked(findWebhook).mockResolvedValue(WEBHOOK)
    vi.mocked(incrementNumberOfCallsFor).mockResolvedValue(10_001)

    const response = await captureWebhookRequest(makeRequest(), mockEnv(), WEBHOOK.id, url)

    expect(response.status).toBe(429)
    const body = (await response.json()) as { error: string; retryAfter: number }
    expect(body.error).toBe('rate_limit_exceeded')
    expect(body.retryAfter).toBeGreaterThan(0)
    expect(body.retryAfter).toBeLessThanOrEqual(86_400)
    expect(saveWebhookRequest).not.toHaveBeenCalled()
  })

  it('returns 404 when the webhook does not exist', async () => {
    vi.mocked(findWebhook).mockResolvedValue(null)

    const response = await captureWebhookRequest(makeRequest(), mockEnv(), 'nonexistent', url)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'webhook_not_found' })
    expect(saveWebhookRequest).not.toHaveBeenCalled()
  })

  it('honours a custom WEBHOOK_RATE_LIMIT_PER_DAY env variable', async () => {
    const env = { ...mockEnv(), WEBHOOK_RATE_LIMIT_PER_DAY: '5' } as unknown as Env
    vi.mocked(findWebhook).mockResolvedValue(WEBHOOK)
    vi.mocked(incrementNumberOfCallsFor).mockResolvedValue(6) // over the custom limit of 5

    const response = await captureWebhookRequest(makeRequest(), env, WEBHOOK.id, url)

    expect(response.status).toBe(429)
  })
})
