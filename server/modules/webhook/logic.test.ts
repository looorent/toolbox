import type { CapturedHeader } from '@shared/modules/webhook/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildWebhook,
  buildWebhookRequest,
  checkRateLimit,
  computeTtlInSeconds,
  PAGE_SIZE,
  RATE_LIMIT_PER_DAY,
  RATE_LIMIT_WINDOW_SECONDS,
  scrubHeaders,
  secondsUntilMidnightUtc,
} from './logic'

vi.mock('./repository', async () => {
  const actual = await vi.importActual<typeof import('./repository')>('./repository')
  return { ...actual, incrementNumberOfCallsFor: vi.fn() }
})

import { incrementNumberOfCallsFor } from './repository'

function mockEnv(overrides?: Record<string, string>): Env {
  return {
    KV: {} as KVNamespace,
    WEBHOOK_TTL_SECONDS: '2592000',
    WEBHOOK_RATE_LIMIT_PER_DAY: '10000',
    RATE_LIMIT_WINDOW_SECONDS: '86401',
    PAGE_SIZE: '25',
    ...overrides,
  } as unknown as Env
}

describe('scrubHeaders', () => {
  it('redacts the authorization header', () => {
    const headers: CapturedHeader[] = [{ name: 'authorization', value: 'Bearer token123' }]
    expect(scrubHeaders(headers)).toEqual([{ name: 'authorization', value: '[redacted]' }])
  })

  it('is case-insensitive', () => {
    const headers: CapturedHeader[] = [{ name: 'Authorization', value: 'Bearer token123' }]
    expect(scrubHeaders(headers)[0].value).toBe('[redacted]')
  })

  it('redacts the cookie header', () => {
    const headers: CapturedHeader[] = [{ name: 'cookie', value: 'session=abc' }]
    expect(scrubHeaders(headers)[0].value).toBe('[redacted]')
  })

  it('redacts x-api-key (api.?key pattern)', () => {
    const headers: CapturedHeader[] = [{ name: 'x-api-key', value: 'my-key' }]
    expect(scrubHeaders(headers)[0].value).toBe('[redacted]')
  })

  it('redacts x-apikey (no separator)', () => {
    const headers: CapturedHeader[] = [{ name: 'x-apikey', value: 'my-key' }]
    expect(scrubHeaders(headers)[0].value).toBe('[redacted]')
  })

  it('redacts headers containing "password"', () => {
    const headers: CapturedHeader[] = [{ name: 'x-password', value: 'secret' }]
    expect(scrubHeaders(headers)[0].value).toBe('[redacted]')
  })

  it('redacts headers containing "secret"', () => {
    const headers: CapturedHeader[] = [{ name: 'x-secret-key', value: 'value' }]
    expect(scrubHeaders(headers)[0].value).toBe('[redacted]')
  })

  it('redacts bearer headers', () => {
    const headers: CapturedHeader[] = [{ name: 'x-bearer-token', value: 'value' }]
    expect(scrubHeaders(headers)[0].value).toBe('[redacted]')
  })

  it('does not redact content-type', () => {
    const headers: CapturedHeader[] = [{ name: 'content-type', value: 'application/json' }]
    expect(scrubHeaders(headers)[0].value).toBe('application/json')
  })

  it('does not redact user-agent', () => {
    const headers: CapturedHeader[] = [{ name: 'user-agent', value: 'curl/7.68.0' }]
    expect(scrubHeaders(headers)[0].value).toBe('curl/7.68.0')
  })

  it('does not redact accept', () => {
    const headers: CapturedHeader[] = [{ name: 'accept', value: '*/*' }]
    expect(scrubHeaders(headers)[0].value).toBe('*/*')
  })

  it('only redacts sensitive headers in a mixed list', () => {
    const headers: CapturedHeader[] = [
      { name: 'content-type', value: 'application/json' },
      { name: 'authorization', value: 'Bearer token' },
      { name: 'accept', value: '*/*' },
    ]
    const result = scrubHeaders(headers)
    expect(result[0].value).toBe('application/json')
    expect(result[1].value).toBe('[redacted]')
    expect(result[2].value).toBe('*/*')
  })

  it('returns an empty array unchanged', () => {
    expect(scrubHeaders([])).toEqual([])
  })
})

describe('computeTtlInSeconds', () => {
  it('returns the numeric value from the env variable', () => {
    expect(computeTtlInSeconds(mockEnv({ WEBHOOK_TTL_SECONDS: '86400' }))).toBe(86400)
  })

  it('falls back to the 30-day default when the env variable is absent', () => {
    expect(computeTtlInSeconds(mockEnv({ WEBHOOK_TTL_SECONDS: '' }))).toBe(30 * 24 * 60 * 60)
  })

  it('falls back to the default for a non-numeric env variable', () => {
    expect(computeTtlInSeconds(mockEnv({ WEBHOOK_TTL_SECONDS: 'invalid' }))).toBe(30 * 24 * 60 * 60)
  })
})

describe('buildWebhook', () => {
  it('returns a webhook with a UUID id, ttlInSeconds from env, and an ISO createdAt', () => {
    const webhook = buildWebhook(mockEnv())
    expect(webhook.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    expect(webhook.ttlInSeconds).toBe(2592000)
    expect(webhook.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('produces a unique id on every call', () => {
    const env = mockEnv()
    expect(buildWebhook(env).id).not.toBe(buildWebhook(env).id)
  })
})

describe('buildWebhookRequest', () => {
  it('captures method, path, query params, headers, body, content-type, and ip', async () => {
    const request = new Request('https://example.com/hooks/abc?foo=bar', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'cf-connecting-ip': '1.2.3.4' },
      body: '{"hello":"world"}',
    })
    const url = new URL('https://example.com/hooks/abc?foo=bar')

    const result = await buildWebhookRequest(request, url)

    expect(result.method).toBe('POST')
    expect(result.path).toBe('/hooks/abc')
    expect(result.queryParams).toEqual({ foo: 'bar' })
    expect(result.body).toBe('{"hello":"world"}')
    expect(result.contentType).toBe('application/json')
    expect(result.ip).toBe('1.2.3.4')
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('sets body to null for requests with no payload', async () => {
    const request = new Request('https://example.com/hooks/abc', { method: 'GET' })
    const url = new URL('https://example.com/hooks/abc')

    const result = await buildWebhookRequest(request, url)

    expect(result.body).toBeNull()
  })

  it('sets ip to null when cf-connecting-ip header is absent', async () => {
    const request = new Request('https://example.com/hooks/abc', { method: 'GET' })
    const url = new URL('https://example.com/hooks/abc')

    const result = await buildWebhookRequest(request, url)

    expect(result.ip).toBeNull()
  })
})

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.mocked(incrementNumberOfCallsFor).mockReset()
  })

  it('returns true when the count is below the daily limit', async () => {
    vi.mocked(incrementNumberOfCallsFor).mockResolvedValue(1)
    expect(await checkRateLimit(mockEnv(), 'wh-1', new Date(), 10_000)).toBe(true)
  })

  it('returns true when the count exactly equals the daily limit', async () => {
    vi.mocked(incrementNumberOfCallsFor).mockResolvedValue(10_000)
    expect(await checkRateLimit(mockEnv(), 'wh-1', new Date(), 10_000)).toBe(true)
  })

  it('returns false when the count exceeds the daily limit', async () => {
    vi.mocked(incrementNumberOfCallsFor).mockResolvedValue(10_001)
    expect(await checkRateLimit(mockEnv(), 'wh-1', new Date(), 10_000)).toBe(false)
  })
})

describe('secondsUntilMidnightUtc', () => {
  it('returns 3 600 seconds when called 1 hour before midnight UTC', () => {
    expect(secondsUntilMidnightUtc(new Date('2024-01-15T23:00:00.000Z'))).toBe(3_600)
  })

  it('returns 1 second when called 1 second before midnight UTC', () => {
    expect(secondsUntilMidnightUtc(new Date('2024-01-15T23:59:59.000Z'))).toBe(1)
  })

  it('returns 86 400 seconds when called exactly at midnight UTC (resets for the new day)', () => {
    expect(secondsUntilMidnightUtc(new Date('2024-01-15T00:00:00.000Z'))).toBe(86_400)
  })

  it('returns 43 200 seconds when called at noon UTC', () => {
    expect(secondsUntilMidnightUtc(new Date('2024-01-15T12:00:00.000Z'))).toBe(43_200)
  })
})

describe('exported constants', () => {
  it('RATE_LIMIT_WINDOW_SECONDS is slightly above 24 hours', () => {
    expect(RATE_LIMIT_WINDOW_SECONDS).toBe(86_401)
  })

  it('RATE_LIMIT_PER_DAY is 10 000', () => {
    expect(RATE_LIMIT_PER_DAY).toBe(10_000)
  })

  it('PAGE_SIZE is 25', () => {
    expect(PAGE_SIZE).toBe(25)
  })
})
