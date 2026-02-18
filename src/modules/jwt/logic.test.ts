import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { decodeJwt, formatClaimValue, formatHeaderValue, formatTimestamp, rawClaimValue } from './logic'

function base64UrlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input)
  const binary = Array.from(bytes, byte => String.fromCodePoint(byte)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function createJwt(header: Record<string, unknown>, payload: Record<string, unknown>, signature = 'test-signature'): string {
  return `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}.${signature}`
}

const TEST_HEADER = { alg: 'HS256', typ: 'JWT' }

describe('decodeJwt', () => {
  describe('empty and null input', () => {
    it('returns null for empty string', () => {
      expect(decodeJwt('')).toBeNull()
    })

    it('returns null for whitespace-only input', () => {
      expect(decodeJwt('   ')).toBeNull()
    })
  })

  describe('invalid tokens', () => {
    it('returns error for single part without dots', () => {
      const result = decodeJwt('notajwt')
      expect(result).toEqual({
        kind: 'error',
        message: 'Invalid JWT: expected at least 2 non-empty parts separated by dots',
      })
    })

    it('returns error for empty parts separated by dot', () => {
      const result = decodeJwt('.')
      expect(result).toEqual({
        kind: 'error',
        message: 'Invalid JWT: expected at least 2 non-empty parts separated by dots',
      })
    })

    it('returns error for empty header with valid payload', () => {
      const payload = base64UrlEncode(JSON.stringify({ sub: 'test' }))
      const result = decodeJwt(`.${payload}.sig`)
      expect(result).toEqual({
        kind: 'error',
        message: 'Invalid JWT: expected at least 2 non-empty parts separated by dots',
      })
    })

    it('returns error for invalid base64 in header', () => {
      const result = decodeJwt('!!!invalid.eyJ0ZXN0IjoxfQ.sig')
      expect(result?.kind).toBe('error')
    })

    it('returns error for non-JSON base64 content', () => {
      const notJson = base64UrlEncode('not valid json')
      const result = decodeJwt(`${notJson}.${notJson}.sig`)
      expect(result?.kind).toBe('error')
    })
  })

  describe('successful decoding', () => {
    it('decodes header and payload', () => {
      const payload = { sub: 'user123', name: 'John Doe' }
      const jwt = createJwt(TEST_HEADER, payload)
      const result = decodeJwt(jwt)

      expect(result?.kind).toBe('success')
      if (result?.kind === 'success') {
        expect(result.header).toEqual(TEST_HEADER)
        expect(result.payload).toEqual(payload)
      }
    })

    it('extracts the signature part', () => {
      const jwt = createJwt(TEST_HEADER, { sub: 'test' }, 'my-signature')
      const result = decodeJwt(jwt)

      if (result?.kind === 'success') {
        expect(result.signature).toBe('my-signature')
      }
    })

    it('returns null signature for two-part JWT', () => {
      const headerPart = base64UrlEncode(JSON.stringify(TEST_HEADER))
      const payloadPart = base64UrlEncode(JSON.stringify({ sub: 'test' }))
      const result = decodeJwt(`${headerPart}.${payloadPart}`)

      if (result?.kind === 'success') {
        expect(result.signature).toBeNull()
      }
    })

    it('returns the raw base64url parts', () => {
      const headerPart = base64UrlEncode(JSON.stringify(TEST_HEADER))
      const payloadPart = base64UrlEncode(JSON.stringify({ sub: 'test' }))
      const result = decodeJwt(`${headerPart}.${payloadPart}.sig123`)

      if (result?.kind === 'success') {
        expect(result.parts).toEqual([headerPart, payloadPart, 'sig123'])
      }
    })

    it('trims whitespace from input', () => {
      const jwt = createJwt(TEST_HEADER, { sub: 'test' })
      const result = decodeJwt(`  ${jwt}  `)

      expect(result?.kind).toBe('success')
    })

    it('decodes base64url with special characters', () => {
      const payload = { data: 'value+with/special=chars' }
      const jwt = createJwt(TEST_HEADER, payload)
      const result = decodeJwt(jwt)

      if (result?.kind === 'success') {
        expect(result.payload).toEqual(payload)
      }
    })

    it('decodes UTF-8 characters in payload correctly', () => {
      const payload = { name: 'Ada Lovelace 👩‍💻', message: 'Hello, 世界' }
      const jwt = createJwt(TEST_HEADER, payload)
      const result = decodeJwt(jwt)

      if (result?.kind === 'success') {
        expect(result.payload).toEqual(payload)
      }
    })
  })

  describe('expiration status', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2030-06-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns null expStatus when no exp claim', () => {
      const jwt = createJwt(TEST_HEADER, { sub: 'test' })
      const result = decodeJwt(jwt)

      if (result?.kind === 'success') {
        expect(result.expStatus).toBeNull()
        expect(result.expInfo).toBeNull()
      }
    })

    it('returns valid when exp is in the future', () => {
      // 2051222400 = 2035-01-01T00:00:00Z
      const jwt = createJwt(TEST_HEADER, { sub: 'test', exp: 2051222400 })
      const result = decodeJwt(jwt)

      if (result?.kind === 'success') {
        expect(result.expStatus).toBe('valid')
        expect(result.expInfo).toContain('Valid for')
      }
    })

    it('returns expired when exp is in the past', () => {
      // 1735689600 = 2025-01-01T00:00:00Z
      const jwt = createJwt(TEST_HEADER, { sub: 'test', exp: 1735689600 })
      const result = decodeJwt(jwt)

      if (result?.kind === 'success') {
        expect(result.expStatus).toBe('expired')
        expect(result.expInfo).toContain('Expired')
      }
    })

    it('returns not-yet when nbf is in the future', () => {
      // nbf = 2051222400 (2035), exp = 2208988800 (2040)
      const jwt = createJwt(TEST_HEADER, { sub: 'test', nbf: 2051222400, exp: 2208988800 })
      const result = decodeJwt(jwt)

      if (result?.kind === 'success') {
        expect(result.expStatus).toBe('not-yet')
        expect(result.expInfo).toContain('Not yet valid')
      }
    })

    it('returns valid when nbf is in the past and exp is in the future', () => {
      // nbf = 1735689600 (2025), exp = 2051222400 (2035)
      const jwt = createJwt(TEST_HEADER, { sub: 'test', nbf: 1735689600, exp: 2051222400 })
      const result = decodeJwt(jwt)

      if (result?.kind === 'success') {
        expect(result.expStatus).toBe('valid')
      }
    })
  })
})

describe('formatTimestamp', () => {
  it('includes year, month, and day', () => {
    // 1735689600 = 2025-01-01T00:00:00Z
    const formatted = formatTimestamp(1735689600)
    expect(formatted).toContain('2025')
    expect(formatted).toContain('January')
  })

  it('formats a different date correctly', () => {
    // 1000000000 = 2001-09-09T01:46:40Z
    const formatted = formatTimestamp(1000000000)
    expect(formatted).toContain('2001')
    expect(formatted).toContain('September')
  })
})

describe('formatClaimValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats timestamp claims with date and relative time', () => {
    const result = formatClaimValue('exp', 1735689600)
    expect(result).toContain('2025')
    expect(result).toContain('January')
  })

  it('formats iat as a timestamp claim', () => {
    const result = formatClaimValue('iat', 1735689600)
    expect(result).toContain('2025')
  })

  it('formats nbf as a timestamp claim', () => {
    const result = formatClaimValue('nbf', 1735689600)
    expect(result).toContain('2025')
  })

  it('formats auth_time as a timestamp claim', () => {
    const result = formatClaimValue('auth_time', 1735689600)
    expect(result).toContain('2025')
  })

  it('does not format non-timestamp numbers as dates', () => {
    expect(formatClaimValue('custom_number', 42)).toBe('42')
  })

  it('joins array values with commas', () => {
    expect(formatClaimValue('roles', ['admin', 'user', 'editor'])).toBe('admin, user, editor')
  })

  it('stringifies object values as JSON', () => {
    expect(formatClaimValue('data', { key: 'value' })).toBe('{"key":"value"}')
  })

  it('returns string values as-is', () => {
    expect(formatClaimValue('iss', 'https://auth.example.com')).toBe('https://auth.example.com')
  })

  it('converts booleans to string', () => {
    expect(formatClaimValue('verified', true)).toBe('true')
  })
})

describe('formatHeaderValue', () => {
  it('formats HS256 with full label', () => {
    expect(formatHeaderValue('alg', 'HS256')).toBe('HS256 (HMAC SHA-256)')
  })

  it('formats RS256 with full label', () => {
    expect(formatHeaderValue('alg', 'RS256')).toBe('RS256 (RSA SHA-256)')
  })

  it('formats ES256 with full label', () => {
    expect(formatHeaderValue('alg', 'ES256')).toBe('ES256 (ECDSA SHA-256)')
  })

  it('formats EdDSA with full label', () => {
    expect(formatHeaderValue('alg', 'EdDSA')).toBe('EdDSA (EdDSA)')
  })

  it('returns unknown algorithm without label', () => {
    expect(formatHeaderValue('alg', 'CUSTOM')).toBe('CUSTOM')
  })

  it('returns non-alg string values as-is', () => {
    expect(formatHeaderValue('typ', 'JWT')).toBe('JWT')
  })

  it('returns non-alg key ID as-is', () => {
    expect(formatHeaderValue('kid', 'key-123')).toBe('key-123')
  })

  it('stringifies object values as JSON', () => {
    expect(formatHeaderValue('jwk', { kty: 'RSA', n: 'abc' })).toBe('{"kty":"RSA","n":"abc"}')
  })

  it('converts number values to string', () => {
    expect(formatHeaderValue('custom', 42)).toBe('42')
  })
})

describe('rawClaimValue', () => {
  it('returns string values as-is', () => {
    expect(rawClaimValue('hello')).toBe('hello')
  })

  it('converts numbers to string', () => {
    expect(rawClaimValue(42)).toBe('42')
  })

  it('converts booleans to string', () => {
    expect(rawClaimValue(true)).toBe('true')
  })

  it('stringifies objects as JSON', () => {
    expect(rawClaimValue({ key: 'value' })).toBe('{"key":"value"}')
  })

  it('stringifies arrays as JSON', () => {
    expect(rawClaimValue(['admin', 'user'])).toBe('["admin","user"]')
  })

  it('converts null to string', () => {
    expect(rawClaimValue(null)).toBe('null')
  })
})
