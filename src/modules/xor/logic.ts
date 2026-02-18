import type { XorInputFormat, XorResult } from './types'

export function calculateXor(input: string, format: XorInputFormat): XorResult | null {
  if (!input.trim()) {
    return null
  }

  const bytes = parseBytes(input, format)

  if (bytes === null) {
    return { error: 'invalid_hex_string' }
  }

  if (bytes.length === 0) {
    return { error: 'no_data_to_process' }
  }

  const xorResult = bytes.reduce((accumulator, byte) => accumulator ^ byte, 0)

  return {
    bytes,
    checksum: xorResult,
    hex: `0x${toHex(xorResult)}`,
    binary: toBinary(xorResult),
    decimal: xorResult,
    bytesHex: bytes.map(toHex).join(' '),
  }
}

function parseBytes(input: string, format: XorInputFormat): number[] | null {
  switch (format) {
    case 'hex':
      return parseHex(input)
    case 'ascii':
      return parseAscii(input)
  }
}

function toHex(value: number): string {
  return value.toString(16).toUpperCase().padStart(2, '0')
}

function toBinary(value: number): string {
  return value.toString(2).padStart(8, '0')
}

const BYTE_MASK = 0xff
function parseAscii(input: string): number[] {
  return Array.from(input).map(character => character.charCodeAt(0) & BYTE_MASK)
}

const HEX_DELIMITERS_PATTERN = /[\s,0x]/g
const VALID_HEX_PATTERN = /^[0-9a-fA-F]+$/
const HEX_PAIR_PATTERN = /.{1,2}/g
function parseHex(input: string): number[] | null {
  const cleanedInput = input.replace(HEX_DELIMITERS_PATTERN, '')

  if (cleanedInput.length % 2 !== 0 || !VALID_HEX_PATTERN.test(cleanedInput)) {
    return null
  }

  const hexPairs = cleanedInput.match(HEX_PAIR_PATTERN) || []
  return hexPairs.map(pair => parseInt(pair, 16))
}
