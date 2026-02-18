import { describe, expect, it } from 'vitest'
import { byteLength, decode, encode } from './logic'

describe('encode', () => {
  describe('empty input', () => {
    it('returns empty string for empty input', () => {
      expect(encode('', 'standard')).toBe('')
    })

    it('returns empty string for empty input in url-safe mode', () => {
      expect(encode('', 'url-safe')).toBe('')
    })
  })

  describe('standard variant', () => {
    it('encodes simple ASCII text', () => {
      expect(encode('Hello, World!', 'standard')).toBe('SGVsbG8sIFdvcmxkIQ==')
    })

    it('encodes text with padding', () => {
      expect(encode('a', 'standard')).toBe('YQ==')
      expect(encode('ab', 'standard')).toBe('YWI=')
      expect(encode('abc', 'standard')).toBe('YWJj')
    })

    it('encodes UTF-8 characters', () => {
      const result = encode('café', 'standard')
      expect(result).toBeTruthy()
      expect(decode(result, 'standard').text).toBe('café')
    })

    it('encodes emoji characters', () => {
      const result = encode('Hello 🌍', 'standard')
      expect(result).toBeTruthy()
      expect(decode(result, 'standard').text).toBe('Hello 🌍')
    })
  })

  describe('url-safe variant', () => {
    it('replaces + with - and / with _', () => {
      const result = encode('subjects?_d', 'url-safe')
      expect(result).not.toContain('+')
      expect(result).not.toContain('/')
    })

    it('removes padding', () => {
      const result = encode('a', 'url-safe')
      expect(result).not.toContain('=')
    })

    it('round-trips correctly', () => {
      const original = 'Hello, World!'
      expect(decode(encode(original, 'url-safe'), 'url-safe').text).toBe(original)
    })
  })
})

describe('decode', () => {
  describe('empty input', () => {
    it('returns empty string with no error for empty input', () => {
      expect(decode('', 'standard')).toEqual({ text: '', error: false })
    })
  })

  describe('standard variant', () => {
    it('decodes valid base64', () => {
      expect(decode('SGVsbG8sIFdvcmxkIQ==', 'standard')).toEqual({ text: 'Hello, World!', error: false })
    })

    it('returns error for invalid base64', () => {
      expect(decode('!!!invalid!!!', 'standard').error).toBe(true)
    })

    it('decodes UTF-8 encoded content', () => {
      const encoded = encode('données', 'standard')
      expect(decode(encoded, 'standard').text).toBe('données')
    })
  })

  describe('url-safe variant', () => {
    it('decodes url-safe base64 with - and _', () => {
      const encoded = encode('subjects?_d', 'url-safe')
      expect(decode(encoded, 'url-safe').text).toBe('subjects?_d')
    })

    it('adds padding back for url-safe', () => {
      const encoded = encode('a', 'url-safe')
      expect(decode(encoded, 'url-safe')).toEqual({ text: 'a', error: false })
    })

    it('handles padding remainder 2', () => {
      const encoded = encode('ab', 'url-safe')
      expect(decode(encoded, 'url-safe').text).toBe('ab')
    })

    it('handles padding remainder 3', () => {
      const encoded = encode('abc', 'url-safe')
      expect(decode(encoded, 'url-safe').text).toBe('abc')
    })
  })

  describe('round-trip', () => {
    const testCases = ['', 'hello', 'Hello, World!', 'café', 'données été', 'Hello 🌍', '{"key":"value"}']

    it.each(testCases)('standard: encode then decode returns original for "%s"', original => {
      const encoded = encode(original, 'standard')
      const decoded = decode(encoded, 'standard')
      expect(decoded.text).toBe(original)
      expect(decoded.error).toBe(false)
    })

    it.each(testCases)('url-safe: encode then decode returns original for "%s"', original => {
      const encoded = encode(original, 'url-safe')
      const decoded = decode(encoded, 'url-safe')
      expect(decoded.text).toBe(original)
      expect(decoded.error).toBe(false)
    })
  })
})

describe('byteLength', () => {
  it('returns 0 for empty string', () => {
    expect(byteLength('')).toBe(0)
  })

  it('calculates size for base64 without padding', () => {
    expect(byteLength('YWJj')).toBe(3)
  })

  it('calculates size for base64 with single padding', () => {
    expect(byteLength('YWI=')).toBe(2)
  })

  it('calculates size for base64 with double padding', () => {
    expect(byteLength('YQ==')).toBe(1)
  })

  it('calculates size for longer content', () => {
    expect(byteLength('SGVsbG8sIFdvcmxkIQ==')).toBe(13)
  })
})
