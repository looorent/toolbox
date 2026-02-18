import { describe, expect, it } from 'vitest'
import { convertNumber } from './logic'

const EMPTY = { decimal: '', hex: '', binary: '', octal: '' }

describe('convertNumber', () => {
  describe('decimal input (radix 10)', () => {
    it('converts a simple integer', () => {
      expect(convertNumber('255', 10)).toEqual({
        decimal: '255',
        hex: 'FF',
        binary: '11111111',
        octal: '377',
      })
    })

    it('converts zero', () => {
      expect(convertNumber('0', 10)).toEqual({
        decimal: '0',
        hex: '0',
        binary: '0',
        octal: '0',
      })
    })

    it('converts a negative number', () => {
      expect(convertNumber('-1', 10)).toEqual({
        decimal: '-1',
        hex: '-1',
        binary: '-1',
        octal: '-1',
      })
    })

    it('converts with leading zeros', () => {
      const result = convertNumber('010', 10)

      expect(result.decimal).toBe('10')
    })

    it('returns empty for empty string', () => {
      expect(convertNumber('', 10)).toEqual(EMPTY)
    })

    it('returns empty for whitespace-only string', () => {
      expect(convertNumber('   ', 10)).toEqual(EMPTY)
    })

    it('returns empty for non-numeric input', () => {
      expect(convertNumber('abc', 10)).toEqual(EMPTY)
    })

    it('trims surrounding whitespace', () => {
      expect(convertNumber('  42  ', 10)).toEqual({
        decimal: '42',
        hex: '2A',
        binary: '101010',
        octal: '52',
      })
    })
  })

  describe('hexadecimal input (radix 16)', () => {
    it('converts a simple hex value', () => {
      expect(convertNumber('FF', 16)).toEqual({
        decimal: '255',
        hex: 'FF',
        binary: '11111111',
        octal: '377',
      })
    })

    it('strips 0x prefix (lowercase)', () => {
      expect(convertNumber('0xff', 16)).toEqual({
        decimal: '255',
        hex: 'FF',
        binary: '11111111',
        octal: '377',
      })
    })

    it('strips 0X prefix (uppercase)', () => {
      expect(convertNumber('0XFF', 16)).toEqual({
        decimal: '255',
        hex: 'FF',
        binary: '11111111',
        octal: '377',
      })
    })

    it('handles lowercase hex digits', () => {
      expect(convertNumber('a0', 16).decimal).toBe('160')
    })

    it('returns empty for empty string', () => {
      expect(convertNumber('', 16)).toEqual(EMPTY)
    })

    it('returns empty when only 0x prefix is present', () => {
      expect(convertNumber('0x', 16)).toEqual(EMPTY)
    })

    it('returns empty for non-hex characters', () => {
      expect(convertNumber('GG', 16)).toEqual(EMPTY)
    })
  })

  describe('binary input (radix 2)', () => {
    it('converts a simple binary value', () => {
      expect(convertNumber('11111111', 2)).toEqual({
        decimal: '255',
        hex: 'FF',
        binary: '11111111',
        octal: '377',
      })
    })

    it('strips whitespace between groups', () => {
      expect(convertNumber('1111 1111', 2)).toEqual({
        decimal: '255',
        hex: 'FF',
        binary: '11111111',
        octal: '377',
      })
    })

    it('returns empty for empty string', () => {
      expect(convertNumber('', 2)).toEqual(EMPTY)
    })

    it('parses up to the first invalid binary digit', () => {
      const result = convertNumber('102', 2)

      expect(result.decimal).toBe('2')
    })

    it('returns empty for fully invalid binary input', () => {
      expect(convertNumber('abc', 2)).toEqual(EMPTY)
    })

    it('converts single bit', () => {
      expect(convertNumber('1', 2)).toEqual({
        decimal: '1',
        hex: '1',
        binary: '1',
        octal: '1',
      })
    })
  })

  describe('octal input (radix 8)', () => {
    it('converts a simple octal value', () => {
      expect(convertNumber('377', 8)).toEqual({
        decimal: '255',
        hex: 'FF',
        binary: '11111111',
        octal: '377',
      })
    })

    it('converts octal with leading zeros', () => {
      const result = convertNumber('0377', 8)

      expect(result.decimal).toBe('255')
    })

    it('returns empty for empty string', () => {
      expect(convertNumber('', 8)).toEqual(EMPTY)
    })

    it('returns empty for invalid octal digits', () => {
      expect(convertNumber('89', 8)).toEqual(EMPTY)
    })
  })

  describe('cross-base consistency', () => {
    it('round-trips through all bases for 42', () => {
      const fromDecimal = convertNumber('42', 10)
      const fromHex = convertNumber(fromDecimal.hex, 16)
      const fromBinary = convertNumber(fromDecimal.binary, 2)
      const fromOctal = convertNumber(fromDecimal.octal, 8)

      expect(fromHex.decimal).toBe('42')
      expect(fromBinary.decimal).toBe('42')
      expect(fromOctal.decimal).toBe('42')
    })

    it('round-trips through all bases for 1000', () => {
      const fromDecimal = convertNumber('1000', 10)
      const fromHex = convertNumber(fromDecimal.hex, 16)
      const fromBinary = convertNumber(fromDecimal.binary, 2)
      const fromOctal = convertNumber(fromDecimal.octal, 8)

      expect(fromHex).toEqual(fromDecimal)
      expect(fromBinary).toEqual(fromDecimal)
      expect(fromOctal).toEqual(fromDecimal)
    })
  })

  describe('edge cases', () => {
    it('handles a very large number', () => {
      const result = convertNumber('1000000000', 10)

      expect(result.hex).toBe('3B9ACA00')
      expect(result.octal).toBe('7346545000')
    })

    it('handles Number.MAX_SAFE_INTEGER', () => {
      const result = convertNumber('9007199254740991', 10)

      expect(result.decimal).toBe('9007199254740991')
      expect(result.hex).toBe('1FFFFFFFFFFFFF')
    })
  })
})
