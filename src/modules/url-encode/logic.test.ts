import { describe, expect, it } from 'vitest'
import { urlDecode, urlEncode } from './logic'

describe('urlEncode', () => {
  describe('when input is empty', () => {
    it('returns empty string for empty input', () => {
      expect(urlEncode('', 'component')).toBe('')
    })

    it('returns empty string for empty input in full mode', () => {
      expect(urlEncode('', 'full')).toBe('')
    })
  })

  describe('component mode', () => {
    it('encodes spaces as %20', () => {
      expect(urlEncode('hello world', 'component')).toBe('hello%20world')
    })

    it('encodes special characters', () => {
      expect(urlEncode('foo=bar&baz=qux', 'component')).toBe('foo%3Dbar%26baz%3Dqux')
    })

    it('encodes slashes and colons', () => {
      expect(urlEncode('https://example.com/path', 'component')).toBe('https%3A%2F%2Fexample.com%2Fpath')
    })

    it('encodes unicode characters', () => {
      expect(urlEncode('café', 'component')).toBe('caf%C3%A9')
    })

    it('leaves alphanumeric characters unchanged', () => {
      expect(urlEncode('abc123', 'component')).toBe('abc123')
    })

    it('leaves unreserved characters unchanged', () => {
      expect(urlEncode('-_.~', 'component')).toBe('-_.~')
    })
  })

  describe('full mode', () => {
    it('encodes spaces as %20', () => {
      expect(urlEncode('hello world', 'full')).toBe('hello%20world')
    })

    it('preserves URL-safe characters', () => {
      expect(urlEncode('https://example.com/path?q=1&r=2', 'full')).toBe('https://example.com/path?q=1&r=2')
    })

    it('preserves hash and fragment', () => {
      expect(urlEncode('https://example.com#section', 'full')).toBe('https://example.com#section')
    })

    it('encodes unicode characters', () => {
      expect(urlEncode('https://example.com/café', 'full')).toBe('https://example.com/caf%C3%A9')
    })
  })
})

describe('urlDecode', () => {
  describe('when input is empty', () => {
    it('returns empty string for empty input', () => {
      expect(urlDecode('', 'component')).toBe('')
    })

    it('returns empty string for empty input in full mode', () => {
      expect(urlDecode('', 'full')).toBe('')
    })
  })

  describe('component mode', () => {
    it('decodes %20 as space', () => {
      expect(urlDecode('hello%20world', 'component')).toBe('hello world')
    })

    it('decodes special characters', () => {
      expect(urlDecode('foo%3Dbar%26baz%3Dqux', 'component')).toBe('foo=bar&baz=qux')
    })

    it('decodes unicode characters', () => {
      expect(urlDecode('caf%C3%A9', 'component')).toBe('café')
    })

    it('returns null for malformed percent encoding', () => {
      expect(urlDecode('%ZZ', 'component')).toBeNull()
    })

    it('returns null for truncated percent encoding', () => {
      expect(urlDecode('%E0%A4', 'component')).toBeNull()
    })

    it('passes through plain text unchanged', () => {
      expect(urlDecode('hello', 'component')).toBe('hello')
    })
  })

  describe('full mode', () => {
    it('decodes a full URL with encoded spaces', () => {
      expect(urlDecode('https://example.com/hello%20world', 'full')).toBe('https://example.com/hello world')
    })

    it('decodes unicode characters', () => {
      expect(urlDecode('https://example.com/caf%C3%A9', 'full')).toBe('https://example.com/café')
    })

    it('returns null for malformed percent encoding', () => {
      expect(urlDecode('%ZZ', 'full')).toBeNull()
    })

    it('preserves already-decoded URL characters', () => {
      expect(urlDecode('https://example.com/path?q=1', 'full')).toBe('https://example.com/path?q=1')
    })
  })

  describe('round-trip', () => {
    it('encode then decode returns original in component mode', () => {
      const original = 'hello world & foo=bar'
      expect(urlDecode(urlEncode(original, 'component'), 'component')).toBe(original)
    })

    it('encode then decode returns original in full mode', () => {
      const original = 'https://example.com/path?q=hello world'
      expect(urlDecode(urlEncode(original, 'full'), 'full')).toBe(original)
    })

    it('round-trips unicode in component mode', () => {
      const original = 'données été'
      expect(urlDecode(urlEncode(original, 'component'), 'component')).toBe(original)
    })
  })
})
