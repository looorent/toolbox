import type { CapturedRequest } from '@shared/modules/webhook/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createWebhook,
  deleteWebhook,
  fetchRequests,
  fetchWebhook,
  formatBodySize,
  formatTimestamp,
  generateCurlCommand,
  generateRawRequest,
  getWebhookUrl,
  methodColor,
  tryFormatJson,
} from './logic'

const BASE_REQUEST: CapturedRequest = {
  id: 'req-1',
  method: 'POST',
  path: '/hooks/abc',
  queryParams: {},
  headers: [{ name: 'content-type', value: 'application/json' }],
  body: '{"key": "value"}',
  contentType: 'application/json',
  timestamp: '2024-01-15T10:30:45.000Z',
  ip: '1.2.3.4',
}

describe('getWebhookUrl', () => {
  it('builds a URL using window.location.origin and the webhook id', () => {
    expect(getWebhookUrl('abc-123')).toBe(`${window.location.origin}/hooks/abc-123`)
  })
})

describe('formatTimestamp', () => {
  it('returns a time string matching HH:MM:SS format', () => {
    const result = formatTimestamp('2024-01-15T10:30:45.000Z')
    expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/)
  })
})

describe('formatBodySize', () => {
  it('returns "0 B" for null', () => {
    expect(formatBodySize(null)).toBe('0 B')
  })

  it('returns "0 B" for empty string', () => {
    expect(formatBodySize('')).toBe('0 B')
  })

  it('returns bytes for content under 1 KB', () => {
    expect(formatBodySize('hello')).toBe('5 B')
  })

  it('returns KB for content between 1 KB and 1 MB', () => {
    expect(formatBodySize('a'.repeat(1024))).toBe('1.0 KB')
  })

  it('returns fractional KB', () => {
    expect(formatBodySize('a'.repeat(1536))).toBe('1.5 KB')
  })

  it('returns MB for content at or above 1 MB', () => {
    expect(formatBodySize('a'.repeat(1024 * 1024))).toBe('1.0 MB')
  })
})

describe('tryFormatJson', () => {
  it('pretty-prints a valid JSON object', () => {
    expect(tryFormatJson('{"a":1}')).toBe('{\n  "a": 1\n}')
  })

  it('pretty-prints a valid JSON array', () => {
    expect(tryFormatJson('[1,2,3]')).toBe('[\n  1,\n  2,\n  3\n]')
  })

  it('returns null for plain text', () => {
    expect(tryFormatJson('not json')).toBeNull()
  })

  it('returns null for malformed JSON', () => {
    expect(tryFormatJson('{a: 1}')).toBeNull()
  })
})

describe('generateRawRequest', () => {
  it('produces only the request line for a GET with no headers, body, or params', () => {
    const request: CapturedRequest = { ...BASE_REQUEST, method: 'GET', queryParams: {}, headers: [], body: null }
    expect(generateRawRequest(request)).toBe('GET /hooks/abc HTTP/1.1')
  })

  it('appends the query string to the request line', () => {
    const request: CapturedRequest = { ...BASE_REQUEST, method: 'GET', queryParams: { foo: 'bar' }, headers: [], body: null }
    expect(generateRawRequest(request)).toContain('?foo=bar')
  })

  it('includes headers after the request line', () => {
    const result = generateRawRequest(BASE_REQUEST)
    expect(result).toContain('\ncontent-type: application/json')
  })

  it('includes the body after a blank line', () => {
    const result = generateRawRequest(BASE_REQUEST)
    expect(result).toContain('\n\n{"key": "value"}')
  })

  it('omits the blank line and body when body is null', () => {
    const request: CapturedRequest = { ...BASE_REQUEST, body: null }
    expect(generateRawRequest(request)).not.toContain('\n\n')
  })
})

describe('methodColor', () => {
  it('returns the design system class for GET', () => {
    expect(methodColor('GET')).toBe('tb-http-method-badge--get')
  })

  it('returns the design system class for POST', () => {
    expect(methodColor('POST')).toBe('tb-http-method-badge--post')
  })

  it('returns the design system class for PUT', () => {
    expect(methodColor('PUT')).toBe('tb-http-method-badge--put')
  })

  it('returns the design system class for PATCH', () => {
    expect(methodColor('PATCH')).toBe('tb-http-method-badge--patch')
  })

  it('returns the design system class for DELETE', () => {
    expect(methodColor('DELETE')).toBe('tb-http-method-badge--delete')
  })
})

describe('generateCurlCommand', () => {
  it('generates a minimal curl command for GET without headers or body', () => {
    const request: CapturedRequest = { ...BASE_REQUEST, method: 'GET', headers: [], body: null, queryParams: {} }
    expect(generateCurlCommand(request, 'https://example.com')).toBe("curl -X GET 'https://example.com/hooks/abc'")
  })

  it('adds the -H flag for each header', () => {
    const result = generateCurlCommand(BASE_REQUEST, 'https://example.com')
    expect(result).toContain("-H 'content-type: application/json'")
  })

  it('adds --data for the request body', () => {
    const result = generateCurlCommand(BASE_REQUEST, 'https://example.com')
    expect(result).toContain('--data \'{"key": "value"}\'')
  })

  it('appends query parameters to the URL', () => {
    const request: CapturedRequest = { ...BASE_REQUEST, queryParams: { foo: 'bar' }, headers: [], body: null }
    expect(generateCurlCommand(request, 'https://example.com')).toContain('?foo=bar')
  })

  it("escapes single quotes in the body using the shell '' technique", () => {
    const request: CapturedRequest = { ...BASE_REQUEST, headers: [], body: "it's here" }
    expect(generateCurlCommand(request, 'https://example.com')).toContain("--data 'it'\\''s here'")
  })
})

describe('createWebhook', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('POSTs to /api/webhooks and returns the parsed webhook', async () => {
    const payload = { id: 'abc-123', ttlInSeconds: 2592000, createdAt: '2024-01-01T00:00:00.000Z' }
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }))

    const result = await createWebhook()

    expect(fetch).toHaveBeenCalledWith('/api/webhooks', { method: 'POST' })
    expect(result).toEqual(payload)
  })

  it('throws when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

    await expect(createWebhook()).rejects.toThrow('Failed to create webhook: 500')
  })
})

describe('fetchWebhook', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('GETs /api/webhooks/:id and returns the parsed webhook', async () => {
    const payload = { id: 'abc-123', ttlInSeconds: 2592000, createdAt: '2024-01-01T00:00:00.000Z' }
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }))

    const result = await fetchWebhook('abc-123')

    expect(fetch).toHaveBeenCalledWith('/api/webhooks/abc-123')
    expect(result).toEqual(payload)
  })

  it('throws when the webhook is not found', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }))

    await expect(fetchWebhook('abc-123')).rejects.toThrow('Failed to fetch webhook: 404')
  })
})

describe('fetchRequests', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('GETs /api/webhooks/:id/requests without a cursor', async () => {
    const payload = { requests: [], nextCursor: null, hasMore: false }
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }))

    await fetchRequests('abc-123')

    expect(fetch).toHaveBeenCalledWith('/api/webhooks/abc-123/requests')
  })

  it('encodes the cursor as a query parameter', async () => {
    const payload = { requests: [], nextCursor: null, hasMore: false }
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }))

    await fetchRequests('abc-123', 'next-cursor-value')

    expect(fetch).toHaveBeenCalledWith('/api/webhooks/abc-123/requests?cursor=next-cursor-value')
  })

  it('throws when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }))

    await expect(fetchRequests('abc-123')).rejects.toThrow('Failed to fetch requests: 500')
  })
})

describe('deleteWebhook', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('DELETEs /api/webhooks/:id', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))

    await deleteWebhook('abc-123')

    expect(fetch).toHaveBeenCalledWith('/api/webhooks/abc-123', { method: 'DELETE' })
  })

  it('throws when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }))

    await expect(deleteWebhook('abc-123')).rejects.toThrow('Failed to delete webhook: 404')
  })
})
