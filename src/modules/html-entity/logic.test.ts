import { describe, expect, it } from 'vitest'
import { decodeEntities, encodeEntities } from './logic'

describe('encodeEntities', () => {
  describe('empty input', () => {
    it('returns empty string for empty input in named format', () => {
      expect(encodeEntities('', 'named')).toBe('')
    })

    it('returns empty string for empty input in decimal format', () => {
      expect(encodeEntities('', 'decimal')).toBe('')
    })

    it('returns empty string for empty input in hex format', () => {
      expect(encodeEntities('', 'hex')).toBe('')
    })
  })

  describe('named format', () => {
    it('encodes angle brackets', () => {
      expect(encodeEntities('<div>', 'named')).toBe('&lt;div&gt;')
    })

    it('encodes ampersand', () => {
      expect(encodeEntities('a & b', 'named')).toBe('a &amp; b')
    })

    it('encodes double quotes', () => {
      expect(encodeEntities('"hello"', 'named')).toBe('&quot;hello&quot;')
    })

    it('leaves plain text unchanged', () => {
      expect(encodeEntities('hello world', 'named')).toBe('hello world')
    })

    it('encodes a full HTML snippet', () => {
      const result = encodeEntities('<p class="test">Hello & welcome</p>', 'named')
      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
      expect(result).toContain('&amp;')
      expect(result).toContain('&quot;')
    })
  })

  describe('decimal format', () => {
    it('encodes angle brackets as decimal entities', () => {
      const result = encodeEntities('<div>', 'decimal')
      expect(result).toContain('&#60;')
      expect(result).toContain('&#62;')
    })

    it('encodes ampersand as decimal entity', () => {
      expect(encodeEntities('&', 'decimal')).toBe('&#38;')
    })

    it('leaves plain text unchanged', () => {
      expect(encodeEntities('hello', 'decimal')).toBe('hello')
    })
  })

  describe('hex format', () => {
    it('encodes angle brackets as hex entities', () => {
      const result = encodeEntities('<div>', 'hex')
      expect(result).toMatch(/&#x3C;/i)
      expect(result).toMatch(/&#x3E;/i)
    })

    it('encodes ampersand as hex entity', () => {
      expect(encodeEntities('&', 'hex')).toMatch(/&#x26;/i)
    })

    it('leaves plain text unchanged', () => {
      expect(encodeEntities('hello', 'hex')).toBe('hello')
    })
  })

  describe('special characters', () => {
    it('encodes newlines in named format', () => {
      const result = encodeEntities('line1\nline2', 'named')
      expect(result).toContain('\n')
    })

    it('handles unicode characters', () => {
      const result = encodeEntities('caf\u00e9', 'named')
      expect(result).toBeTruthy()
    })
  })
})

describe('decodeEntities', () => {
  describe('empty input', () => {
    it('returns empty string for empty input', () => {
      expect(decodeEntities('')).toBe('')
    })
  })

  describe('named entities', () => {
    it('decodes named angle brackets', () => {
      expect(decodeEntities('&lt;div&gt;')).toBe('<div>')
    })

    it('decodes named ampersand', () => {
      expect(decodeEntities('a &amp; b')).toBe('a & b')
    })

    it('decodes named quotes', () => {
      expect(decodeEntities('&quot;hello&quot;')).toBe('"hello"')
    })

    it('decodes non-breaking space', () => {
      expect(decodeEntities('hello&nbsp;world')).toBe('hello\u00a0world')
    })
  })

  describe('decimal entities', () => {
    it('decodes decimal angle brackets', () => {
      expect(decodeEntities('&#60;div&#62;')).toBe('<div>')
    })

    it('decodes decimal ampersand', () => {
      expect(decodeEntities('&#38;')).toBe('&')
    })
  })

  describe('hex entities', () => {
    it('decodes hex angle brackets', () => {
      expect(decodeEntities('&#x3C;div&#x3E;')).toBe('<div>')
    })

    it('decodes hex ampersand', () => {
      expect(decodeEntities('&#x26;')).toBe('&')
    })

    it('handles uppercase hex', () => {
      expect(decodeEntities('&#x3c;')).toBe('<')
    })
  })

  describe('mixed entities', () => {
    it('decodes a mix of named and decimal entities', () => {
      expect(decodeEntities('&lt;&#38;&#x3E;')).toBe('<&>')
    })

    it('leaves plain text unchanged', () => {
      expect(decodeEntities('hello world')).toBe('hello world')
    })
  })
})

describe('round-trip', () => {
  const testCases = ['<div class="example">Hello & welcome</div>', 'a < b && c > d', '"quoted" & \'single\'', 'Special: \u00e9\u00e8\u00ea']

  it.each(testCases)('named: encode then decode returns original for "%s"', original => {
    expect(decodeEntities(encodeEntities(original, 'named'))).toBe(original)
  })

  it.each(testCases)('decimal: encode then decode returns original for "%s"', original => {
    expect(decodeEntities(encodeEntities(original, 'decimal'))).toBe(original)
  })

  it.each(testCases)('hex: encode then decode returns original for "%s"', original => {
    expect(decodeEntities(encodeEntities(original, 'hex'))).toBe(original)
  })
})
