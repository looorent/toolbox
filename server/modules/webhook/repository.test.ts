import type { CapturedRequest, WebhookMetadata } from '@shared/modules/webhook/types'
import { describe, expect, it, vi } from 'vitest'
import {
  computePage,
  deleteWebhook,
  findPageOfWebhookRequests,
  findWebhook,
  incrementNumberOfCallsFor,
  saveWebhook,
  saveWebhookRequest,
} from './repository'

function createMockKv() {
  return {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue({ keys: [], list_complete: true, cursor: '' }),
    getWithMetadata: vi.fn().mockResolvedValue({ value: null, metadata: null }),
  }
}

function createMockEnv(kv = createMockKv()) {
  const env = {
    KV: kv,
    WEBHOOK_TTL_SECONDS: '2592000',
    WEBHOOK_RATE_LIMIT_PER_DAY: '10000',
    RATE_LIMIT_WINDOW_SECONDS: '86401',
    PAGE_SIZE: '25',
  } as unknown as Env
  return { env, kv }
}

const WEBHOOK: WebhookMetadata = {
  id: 'wh-abc-123',
  ttlInSeconds: 2592000,
  createdAt: '2024-01-01T00:00:00.000Z',
}

const CAPTURED_REQUEST: CapturedRequest = {
  id: 'req-xyz-456',
  method: 'POST',
  path: '/hooks/wh-abc-123',
  queryParams: {},
  headers: [],
  body: '{"hello": "world"}',
  contentType: 'application/json',
  timestamp: '2024-01-15T10:30:45.000Z',
  ip: '1.2.3.4',
}

describe('computePage', () => {
  it('defaults to PAGE_SIZE when limit is null', () => {
    const { env } = createMockEnv()
    expect(computePage(null, null, env).limit).toBe(25)
  })

  it('uses env PAGE_SIZE when provided limit is null', () => {
    const { env } = createMockEnv()
    expect(computePage(null, null, env).limit).toBe(25)
  })

  it('clamps limit to a maximum of 100', () => {
    const { env } = createMockEnv()
    expect(computePage('200', null, env).limit).toBe(100)
  })

  it('treats "0" as absent and falls back to PAGE_SIZE', () => {
    const { env } = createMockEnv()
    expect(computePage('0', null, env).limit).toBe(25)
  })

  it('clamps a negative limit to 1', () => {
    const { env } = createMockEnv()
    expect(computePage('-5', null, env).limit).toBe(1)
  })

  it('uses a valid limit as provided', () => {
    const { env } = createMockEnv()
    expect(computePage('10', null, env).limit).toBe(10)
  })

  it('returns the provided cursor unchanged', () => {
    const { env } = createMockEnv()
    expect(computePage(null, 'my-cursor', env).cursor).toBe('my-cursor')
  })

  it('returns null cursor when none is provided', () => {
    const { env } = createMockEnv()
    expect(computePage(null, null, env).cursor).toBeNull()
  })
})

describe('findWebhook', () => {
  it('returns the parsed webhook when the key exists', async () => {
    const { env, kv } = createMockEnv()
    kv.get.mockResolvedValue(JSON.stringify(WEBHOOK))

    const result = await findWebhook(env, WEBHOOK.id)

    expect(result).toEqual(WEBHOOK)
    expect(kv.get).toHaveBeenCalledWith(`webhook:${WEBHOOK.id}`)
  })

  it('returns null when the key does not exist', async () => {
    const { env } = createMockEnv() // kv.get already returns null by default
    expect(await findWebhook(env, 'nonexistent')).toBeNull()
  })

  it('returns null and does not throw when KV.get rejects', async () => {
    const { env, kv } = createMockEnv()
    kv.get.mockRejectedValue(new Error('KV unavailable'))

    expect(await findWebhook(env, WEBHOOK.id)).toBeNull()
  })
})

describe('saveWebhook', () => {
  it('calls KV.put with the correct key, serialised value, and TTL', async () => {
    const { env, kv } = createMockEnv()

    await saveWebhook(WEBHOOK, env)

    expect(kv.put).toHaveBeenCalledWith(`webhook:${WEBHOOK.id}`, JSON.stringify(WEBHOOK), { expirationTtl: WEBHOOK.ttlInSeconds })
  })

  it('returns the saved webhook unchanged', async () => {
    const { env } = createMockEnv()
    expect(await saveWebhook(WEBHOOK, env)).toEqual(WEBHOOK)
  })
})

describe('saveWebhookRequest', () => {
  it('stores the request under a reversed-timestamp key for newest-first ordering', async () => {
    const { env, kv } = createMockEnv()

    await saveWebhookRequest(CAPTURED_REQUEST, WEBHOOK, env)

    const ts = new Date(CAPTURED_REQUEST.timestamp).getTime()
    const reversedTs = (9999999999999 - ts).toString().padStart(13, '0')
    const expectedKey = `webhook:${WEBHOOK.id}:req:${reversedTs}:${CAPTURED_REQUEST.id}`

    expect(kv.put).toHaveBeenCalledWith(expectedKey, JSON.stringify(CAPTURED_REQUEST), { expirationTtl: 2592000 })
  })

  it('refreshes the webhook metadata TTL after saving the request', async () => {
    const { env, kv } = createMockEnv()

    await saveWebhookRequest(CAPTURED_REQUEST, WEBHOOK, env)

    expect(kv.put).toHaveBeenCalledWith(`webhook:${WEBHOOK.id}`, JSON.stringify(WEBHOOK), { expirationTtl: 2592000 })
  })

  it('earlier timestamps produce lexicographically larger keys than later ones', async () => {
    const kv = createMockKv()
    const { env } = createMockEnv(kv)

    const older: CapturedRequest = { ...CAPTURED_REQUEST, id: 'older', timestamp: '2024-01-01T00:00:00.000Z' }
    const newer: CapturedRequest = { ...CAPTURED_REQUEST, id: 'newer', timestamp: '2024-06-01T00:00:00.000Z' }

    await saveWebhookRequest(older, WEBHOOK, env)
    await saveWebhookRequest(newer, WEBHOOK, env)

    const putKeys = kv.put.mock.calls.map((c: unknown[]) => c[0] as string).filter(k => k.includes(':req:'))
    const olderKey = putKeys.find(k => k.includes('older')) ?? ''
    const newerKey = putKeys.find(k => k.includes('newer')) ?? ''

    expect(olderKey).toMatch(/:req:/)
    expect(newerKey).toMatch(/:req:/)

    // Reversed-timestamp means newer records get smaller (lexicographically earlier) keys
    expect(newerKey < olderKey).toBe(true)
  })
})

describe('findPageOfWebhookRequests', () => {
  it('returns requests and hasMore=false when the list is complete', async () => {
    const { env, kv } = createMockEnv()
    kv.list.mockResolvedValue({ keys: [{ name: 'webhook:wh-abc-123:req:key1' }], list_complete: true, cursor: '' })
    kv.get.mockResolvedValue(JSON.stringify(CAPTURED_REQUEST))

    const result = await findPageOfWebhookRequests(env, WEBHOOK.id, 25, null)

    expect(result.hasMore).toBe(false)
    expect(result.nextCursor).toBeNull()
    expect(result.requests).toHaveLength(1)
    expect(result.requests[0]).toEqual(CAPTURED_REQUEST)
  })

  it('returns hasMore=true and a cursor when there are more pages', async () => {
    const { env, kv } = createMockEnv()
    kv.list.mockResolvedValue({ keys: [{ name: 'k1' }], list_complete: false, cursor: 'page2' })
    kv.get.mockResolvedValue(JSON.stringify(CAPTURED_REQUEST))

    const result = await findPageOfWebhookRequests(env, WEBHOOK.id, 1, null)

    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toBe('page2')
  })

  it('silently drops keys whose values are no longer in KV', async () => {
    const { env, kv } = createMockEnv()
    kv.list.mockResolvedValue({ keys: [{ name: 'k1' }, { name: 'k2' }], list_complete: true, cursor: '' })
    // First key has a value, second has been evicted
    kv.get.mockResolvedValueOnce(JSON.stringify(CAPTURED_REQUEST)).mockResolvedValueOnce(null)

    const result = await findPageOfWebhookRequests(env, WEBHOOK.id, 2, null)

    expect(result.requests).toHaveLength(1)
  })

  it('re-throws KV errors', async () => {
    const { env, kv } = createMockEnv()
    kv.list.mockRejectedValue(new Error('KV error'))

    await expect(findPageOfWebhookRequests(env, WEBHOOK.id, 25, null)).rejects.toThrow('KV error')
  })
})

describe('deleteWebhook', () => {
  it('deletes all request keys and the metadata key in a single page', async () => {
    const { env, kv } = createMockEnv()
    kv.list.mockResolvedValue({
      keys: [{ name: 'webhook:wh-abc-123:req:key-1' }, { name: 'webhook:wh-abc-123:req:key-2' }],
      list_complete: true,
      cursor: '',
    })

    await deleteWebhook(env, WEBHOOK.id)

    expect(kv.list).toHaveBeenCalledWith(expect.objectContaining({ limit: 25 }))
    expect(kv.delete).toHaveBeenCalledWith('webhook:wh-abc-123:req:key-1')
    expect(kv.delete).toHaveBeenCalledWith('webhook:wh-abc-123:req:key-2')
    expect(kv.delete).toHaveBeenCalledWith(`webhook:${WEBHOOK.id}`)
  })

  it('pages through multiple KV list results until complete', async () => {
    const { env, kv } = createMockEnv()
    kv.list
      .mockResolvedValueOnce({ keys: [{ name: 'webhook:wh-1:req:k1' }], list_complete: false, cursor: 'p2' })
      .mockResolvedValueOnce({ keys: [{ name: 'webhook:wh-1:req:k2' }], list_complete: true, cursor: '' })

    await deleteWebhook(env, 'wh-1')

    // 2 request keys + 1 metadata key = 3 deletes
    expect(kv.delete).toHaveBeenCalledTimes(3)
  })
})

describe('incrementNumberOfCallsFor', () => {
  it('initialises the counter at 1 when no prior count exists', async () => {
    const { env, kv } = createMockEnv()
    kv.get.mockResolvedValue(null)

    const count = await incrementNumberOfCallsFor(env, 'wh-1', new Date('2024-01-15'))

    expect(count).toBe(1)
    expect(kv.put).toHaveBeenCalledWith('webhook:wh-1:rate:2024-01-15', '1', expect.objectContaining({ expirationTtl: expect.any(Number) }))
  })

  it('increments an existing counter', async () => {
    const { env, kv } = createMockEnv()
    kv.get.mockResolvedValue('5')

    const count = await incrementNumberOfCallsFor(env, 'wh-1', new Date('2024-01-15'))

    expect(count).toBe(6)
    expect(kv.put).toHaveBeenCalledWith('webhook:wh-1:rate:2024-01-15', '6', expect.any(Object))
  })

  it('keys the counter by YYYY-MM-DD date', async () => {
    const { env, kv } = createMockEnv()

    await incrementNumberOfCallsFor(env, 'wh-1', new Date('2024-03-07T14:00:00.000Z'))

    const putKey = kv.put.mock.calls[0][0] as string
    expect(putKey).toBe('webhook:wh-1:rate:2024-03-07')
  })
})
