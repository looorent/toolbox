import { describe, expect, it } from 'vitest'
import { calculateXor } from './logic'

describe('calculateXor', () => {
  describe('when input is empty or whitespace', () => {
    it('returns null for empty string', () => {
      expect(calculateXor('', 'hex')).toBeNull()
    })

    it('returns null for whitespace-only string', () => {
      expect(calculateXor('   ', 'hex')).toBeNull()
    })

    it('returns null for tabs and newlines', () => {
      expect(calculateXor('\t\n', 'ascii')).toBeNull()
    })
  })

  describe('hex format', () => {
    it('computes XOR for a single byte', () => {
      const result = calculateXor('FF', 'hex')

      expect(result).toEqual({
        bytes: [0xff],
        checksum: 0xff,
        hex: '0xFF',
        binary: '11111111',
        decimal: 255,
        bytesHex: 'FF',
      })
    })

    it('computes XOR for two bytes', () => {
      const result = calculateXor('FF 1F', 'hex')

      expect(result).toEqual({
        bytes: [0xff, 0x1f],
        checksum: 0xe0,
        hex: '0xE0',
        binary: '11100000',
        decimal: 224,
        bytesHex: 'FF 1F',
      })
    })

    it('computes XOR for multiple bytes', () => {
      const result = calculateXor('11 22 33', 'hex')

      expect(result).toEqual({
        bytes: [0x11, 0x22, 0x33],
        checksum: 0x00,
        hex: '0x00',
        binary: '00000000',
        decimal: 0,
        bytesHex: '11 22 33',
      })
    })

    it('handles comma-separated hex', () => {
      const result = calculateXor('AB,CD', 'hex')

      expect(result).toEqual({
        bytes: [0xab, 0xcd],
        checksum: 0x66,
        hex: '0x66',
        binary: '01100110',
        decimal: 102,
        bytesHex: 'AB CD',
      })
    })

    it('handles 0x-prefixed hex pairs', () => {
      const result = calculateXor('0xAB 0xCD', 'hex')

      expect(result).toEqual({
        bytes: [0xab, 0xcd],
        checksum: 0x66,
        hex: '0x66',
        binary: '01100110',
        decimal: 102,
        bytesHex: 'AB CD',
      })
    })

    it('handles contiguous hex string without separators', () => {
      const result = calculateXor('AABB', 'hex')

      expect(result).toEqual({
        bytes: [0xaa, 0xbb],
        checksum: 0x11,
        hex: '0x11',
        binary: '00010001',
        decimal: 17,
        bytesHex: 'AA BB',
      })
    })

    it('is case-insensitive', () => {
      const upper = calculateXor('aB cD', 'hex')
      const lower = calculateXor('AB CD', 'hex')

      expect(upper).toEqual(lower)
    })

    it('returns error for odd-length hex string', () => {
      expect(calculateXor('ABC', 'hex')).toEqual({ error: 'invalid_hex_string' })
    })

    it('returns error for non-hex characters', () => {
      expect(calculateXor('GG', 'hex')).toEqual({ error: 'invalid_hex_string' })
    })

    it('returns error for single hex digit', () => {
      expect(calculateXor('A', 'hex')).toEqual({ error: 'invalid_hex_string' })
    })

    it('computes XOR that results in zero', () => {
      const result = calculateXor('AA AA', 'hex')

      expect(result).toEqual({
        bytes: [0xaa, 0xaa],
        checksum: 0x00,
        hex: '0x00',
        binary: '00000000',
        decimal: 0,
        bytesHex: 'AA AA',
      })
    })
  })

  describe('ascii format', () => {
    it('computes XOR for a single character', () => {
      const result = calculateXor('A', 'ascii')

      expect(result).toEqual({
        bytes: [0x41],
        checksum: 0x41,
        hex: '0x41',
        binary: '01000001',
        decimal: 65,
        bytesHex: '41',
      })
    })

    it('computes XOR for a word', () => {
      const result = calculateXor('Hi', 'ascii')
      const expected = 'H'.charCodeAt(0) ^ 'i'.charCodeAt(0)

      expect(result?.checksum).toBe(expected)
      expect(result?.bytes).toEqual([0x48, 0x69])
    })

    it('handles special characters', () => {
      const result = calculateXor('!@', 'ascii')

      expect(result?.bytes).toEqual([0x21, 0x40])
      expect(result?.checksum).toBe(0x21 ^ 0x40)
    })

    it('handles spaces as data bytes', () => {
      const result = calculateXor('A B', 'ascii')

      expect(result?.bytes).toEqual([0x41, 0x20, 0x42])
      expect(result?.checksum).toBe(0x41 ^ 0x20 ^ 0x42)
    })

    it('masks characters to single byte', () => {
      const result = calculateXor('\u00FF\u0100', 'ascii')

      expect(result?.bytes).toEqual([0xff, 0x00])
    })
  })
})
