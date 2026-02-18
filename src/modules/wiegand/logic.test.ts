import { describe, expect, it } from 'vitest'
import { processWiegand } from './logic'

describe('processWiegand', () => {
  describe('when input is empty or whitespace', () => {
    it('returns null for empty string', async () => {
      expect(await processWiegand('encode', '')).toBeNull()
    })

    it('returns null for whitespace-only string', async () => {
      expect(await processWiegand('encode', '   ')).toBeNull()
    })

    it('returns null for tabs and newlines', async () => {
      expect(await processWiegand('decode26', '\t\n')).toBeNull()
    })

    it('returns null regardless of mode', async () => {
      expect(await processWiegand('decode64', '  ')).toBeNull()
    })
  })

  describe('encode mode', () => {
    it('encodes a license plate to both W26 and W64', async () => {
      const result = await processWiegand('encode', 'ABC 123')

      expect(result).toEqual({
        mode: 'encode',
        encoded26: {
          wiegand26InHexadecimal: expect.any(String),
          wiegand26InDecimal: expect.any(Number),
          facilityCode: expect.any(Number),
          idNumber: expect.any(Number),
          facilityCodeAndIdNumber: expect.any(Number),
        },
        encoded64: expect.any(String),
      })
      if (result?.mode === 'encode') {
        expect(result.encoded26?.wiegand26InHexadecimal.length).toBeGreaterThan(0)
        expect(result.encoded64?.length).toBe(16)
      }
    })

    it('trims whitespace before encoding', async () => {
      const trimmed = await processWiegand('encode', '  ABC 123  ')
      const plain = await processWiegand('encode', 'ABC 123')

      expect(trimmed).toEqual(plain)
    })

    it('is case insensitive', async () => {
      const lower = await processWiegand('encode', 'abc 123')
      const upper = await processWiegand('encode', 'ABC 123')

      expect(lower).toEqual(upper)
    })

    it('encodes a short plate', async () => {
      const result = await processWiegand('encode', 'A')

      expect(result?.mode).toBe('encode')
      if (result?.mode === 'encode') {
        expect(result.encoded26).not.toBeNull()
        expect(result.encoded64).not.toBeNull()
      }
    })

    it('encodes a 10-character plate (max length)', async () => {
      const result = await processWiegand('encode', 'ABCDEFGHIJ')

      expect(result?.mode).toBe('encode')
      if (result?.mode === 'encode') {
        expect(result.encoded26).not.toBeNull()
        expect(result.encoded64).not.toBeNull()
      }
    })

    it('returns error when plate exceeds 10 characters', async () => {
      const result = await processWiegand('encode', 'ABCDEFGHIJK')

      expect(result).toEqual({
        mode: 'error',
        error: expect.any(String),
      })
    })
  })

  describe('decode26 mode', () => {
    it('decodes a valid W26 hex string', async () => {
      const encoded = await processWiegand('encode', 'ABC 123')
      if (encoded?.mode !== 'encode' || !encoded.encoded26) {
        throw new Error('encode failed')
      }
      const hex = encoded.encoded26.wiegand26InHexadecimal

      const result = await processWiegand('decode26', hex)

      expect(result).toEqual({
        mode: 'decode26',
        decoded: {
          wiegand26InHexadecimal: hex,
          wiegand26InDecimal: expect.any(Number),
          facilityCode: expect.any(Number),
          idNumber: expect.any(Number),
          facilityCodeAndIdNumber: expect.any(Number),
        },
      })
    })

    it('round-trips with encode26', async () => {
      const encoded = await processWiegand('encode', 'ABC 123')
      if (encoded?.mode !== 'encode' || !encoded.encoded26) {
        throw new Error('encode failed')
      }

      const decoded = await processWiegand('decode26', encoded.encoded26.wiegand26InHexadecimal)

      expect(decoded).toEqual({
        mode: 'decode26',
        decoded: encoded.encoded26,
      })
    })

    it('trims whitespace before decoding', async () => {
      const encoded = await processWiegand('encode', 'XYZ')
      if (encoded?.mode !== 'encode' || !encoded.encoded26) {
        throw new Error('encode failed')
      }
      const hex = encoded.encoded26.wiegand26InHexadecimal

      const trimmed = await processWiegand('decode26', `  ${hex}  `)
      const plain = await processWiegand('decode26', hex)

      expect(trimmed).toEqual(plain)
    })
  })

  describe('decode64 mode', () => {
    it('decodes a valid W64 hex string to a license plate', async () => {
      const encoded = await processWiegand('encode', 'TEST')
      if (encoded?.mode !== 'encode' || !encoded.encoded64) {
        throw new Error('encode failed')
      }

      const result = await processWiegand('decode64', encoded.encoded64)

      expect(result).toEqual({
        mode: 'decode64',
        decoded: expect.stringContaining('TEST'),
      })
    })

    it('round-trips with encode64', async () => {
      const encoded = await processWiegand('encode', 'ABC 123')
      if (encoded?.mode !== 'encode' || !encoded.encoded64) {
        throw new Error('encode failed')
      }

      const decoded = await processWiegand('decode64', encoded.encoded64)

      expect(decoded?.mode).toBe('decode64')
      if (decoded?.mode === 'decode64') {
        expect(decoded.decoded).toContain('ABC')
        expect(decoded.decoded).toContain('123')
      }
    })

    it('trims whitespace before decoding', async () => {
      const encoded = await processWiegand('encode', 'XYZ')
      if (encoded?.mode !== 'encode' || !encoded.encoded64) {
        throw new Error('encode failed')
      }
      const hex = encoded.encoded64

      const trimmed = await processWiegand('decode64', `  ${hex}  `)
      const plain = await processWiegand('decode64', hex)

      expect(trimmed).toEqual(plain)
    })
  })

  describe('error handling', () => {
    it('returns a WiegandError when encoding throws', async () => {
      const result = await processWiegand('encode', 'THIS_IS_WAY_TOO_LONG')

      expect(result).toEqual({
        mode: 'error',
        error: expect.any(String),
      })
    })

    it('error message is the exception message when Error is thrown', async () => {
      const result = await processWiegand('encode', 'ABCDEFGHIJKLMNOP')

      if (result?.mode === 'error') {
        expect(result.error).not.toBe('conversion_failed')
        expect(result.error.length).toBeGreaterThan(0)
      }
    })
  })
})
