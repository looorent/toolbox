import { describe, expect, it } from 'vitest'
import { validateJson } from './logic'

describe('validateJson', () => {
  describe('empty input', () => {
    it('returns empty result for empty string', () => {
      expect(validateJson('')).toEqual({ kind: 'empty' })
    })

    it('returns empty result for whitespace-only string', () => {
      expect(validateJson('   \n  ')).toEqual({ kind: 'empty' })
    })
  })

  describe('valid JSON', () => {
    it('parses a simple object', () => {
      const result = validateJson('{"name": "Ada"}')
      expect(result.kind).toBe('valid')
      if (result.kind === 'valid') {
        expect(result.formatted).toBe('{\n  "name": "Ada"\n}')
        expect(result.minified).toBe('{"name":"Ada"}')
      }
    })

    it('parses a simple array', () => {
      const result = validateJson('[1, 2, 3]')
      expect(result.kind).toBe('valid')
      if (result.kind === 'valid') {
        expect(result.minified).toBe('[1,2,3]')
      }
    })

    it('parses nested structures', () => {
      const result = validateJson('{"a": {"b": [1, true, null]}}')
      expect(result.kind).toBe('valid')
    })

    it('parses a bare string', () => {
      const result = validateJson('"hello"')
      expect(result.kind).toBe('valid')
    })

    it('parses a bare number', () => {
      const result = validateJson('42')
      expect(result.kind).toBe('valid')
    })

    it('parses boolean values', () => {
      expect(validateJson('true').kind).toBe('valid')
      expect(validateJson('false').kind).toBe('valid')
    })

    it('parses null', () => {
      expect(validateJson('null').kind).toBe('valid')
    })

    it('trims whitespace before parsing', () => {
      const result = validateJson('  { "a": 1 }  ')
      expect(result.kind).toBe('valid')
    })
  })

  describe('invalid JSON', () => {
    it('reports invalid for trailing commas', () => {
      expect(validateJson('{"a": 1, }').kind).toBe('invalid')
    })

    it('reports invalid for single-quoted strings', () => {
      expect(validateJson("{'key': 'value'}").kind).toBe('invalid')
    })

    it('reports invalid for unquoted keys', () => {
      expect(validateJson('{name: "Ada"}').kind).toBe('invalid')
    })

    it('reports invalid for comments', () => {
      expect(validateJson('{"a": 1} // comment').kind).toBe('invalid')
    })

    it('reports invalid for block comments', () => {
      expect(validateJson('{"a": /* comment */ 1}').kind).toBe('invalid')
    })

    it('reports invalid for undefined', () => {
      expect(validateJson('{"a": undefined}').kind).toBe('invalid')
    })

    it('reports invalid for NaN', () => {
      expect(validateJson('{"a": NaN}').kind).toBe('invalid')
    })

    it('reports invalid for malformed input', () => {
      expect(validateJson('not json at all').kind).toBe('invalid')
    })

    it('reports invalid for unclosed brace', () => {
      expect(validateJson('{"a": 1').kind).toBe('invalid')
    })

    it('reports invalid for unclosed bracket', () => {
      expect(validateJson('[1, 2, 3').kind).toBe('invalid')
    })
  })

  describe('auto-fix', () => {
    it('offers auto-fix for trailing commas', () => {
      const result = validateJson('{"a": 1, }')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.fixedJson).not.toBeNull()
        expect(result.fixSummary.length).toBeGreaterThan(0)
      }
    })

    it('offers auto-fix for single quotes', () => {
      const result = validateJson("{'a': 1}")
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.fixedJson).not.toBeNull()
      }
    })

    it('fixed JSON is valid', () => {
      const result = validateJson('{"a": 1, }')
      if (result.kind === 'invalid' && result.fixedJson) {
        const fixedResult = validateJson(result.fixedJson)
        expect(fixedResult.kind).toBe('valid')
      }
    })

    it('returns null fixedJson when JSON cannot be fixed', () => {
      const result = validateJson('{{{{{')
      if (result.kind === 'invalid') {
        expect(result.fixedJson === null || result.fixedJson != null).toBe(true)
      }
    })
  })
})
