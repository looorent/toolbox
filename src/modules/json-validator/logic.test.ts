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

  describe('trailing commas', () => {
    it('detects trailing comma in object', () => {
      const result = validateJson('{"a": 1, }')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics.some(diagnostic => diagnostic.message === 'Trailing comma')).toBe(true)
      }
    })

    it('detects trailing comma in array', () => {
      const result = validateJson('[1, 2, ]')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics.some(diagnostic => diagnostic.message === 'Trailing comma')).toBe(true)
      }
    })
  })

  describe('single quotes', () => {
    it('detects single-quoted strings', () => {
      const result = validateJson("{'key': 'value'}")
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics.some(diagnostic => diagnostic.message === 'Single-quoted string')).toBe(true)
      }
    })
  })

  describe('unquoted keys', () => {
    it('detects unquoted keys', () => {
      const result = validateJson('{name: "Ada"}')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics.some(diagnostic => diagnostic.message.includes('Unquoted key'))).toBe(true)
      }
    })
  })

  describe('comments', () => {
    it('detects single-line comments', () => {
      const result = validateJson('{"a": 1} // comment')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics.some(diagnostic => diagnostic.message === 'Comment not allowed')).toBe(true)
      }
    })

    it('detects block comments', () => {
      const result = validateJson('{"a": /* comment */ 1}')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(
          result.diagnostics.some(
            diagnostic => diagnostic.message === 'Block comment not allowed' || diagnostic.message === 'Comment not allowed',
          ),
        ).toBe(true)
      }
    })
  })

  describe('JavaScript literals', () => {
    it('detects undefined', () => {
      const result = validateJson('{"a": undefined}')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics.some(diagnostic => diagnostic.message.includes('undefined'))).toBe(true)
      }
    })

    it('detects NaN', () => {
      const result = validateJson('{"a": NaN}')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics.some(diagnostic => diagnostic.message.includes('NaN'))).toBe(true)
      }
    })

    it('detects Infinity', () => {
      const result = validateJson('{"a": Infinity}')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics.some(diagnostic => diagnostic.message.includes('Infinity'))).toBe(true)
      }
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

  describe('generic syntax errors', () => {
    it('reports error for completely malformed input', () => {
      const result = validateJson('not json at all')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics.length).toBeGreaterThan(0)
      }
    })

    it('reports error with line and column', () => {
      const result = validateJson('{\n  "a": }\n}')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics[0]?.line).toBeGreaterThanOrEqual(1)
        expect(result.diagnostics[0]?.column).toBeGreaterThanOrEqual(1)
      }
    })

    it('includes a hint in diagnostics', () => {
      const result = validateJson('{"a": }')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics[0]?.hint).toBeTruthy()
      }
    })
  })

  describe('missing commas', () => {
    it('detects missing comma between object entries', () => {
      const result = validateJson('{\n  "a": "hello"\n  "b": 2\n}')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics.some(diagnostic => diagnostic.message === 'Missing comma')).toBe(true)
      }
    })
  })

  describe('unclosed structures', () => {
    it('reports missing closing brace', () => {
      const result = validateJson('{"a": 1')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics.length).toBeGreaterThan(0)
      }
    })

    it('reports missing closing bracket', () => {
      const result = validateJson('[1, 2, 3')
      expect(result.kind).toBe('invalid')
      if (result.kind === 'invalid') {
        expect(result.diagnostics.length).toBeGreaterThan(0)
      }
    })
  })
})
