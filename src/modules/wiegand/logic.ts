import { decode26, decode64, encode26, encode64 } from 'anpr-wiegand'
import type { Decode26InputFormat, WiegandDecoded26, WiegandEncoded, WiegandMode, WiegandResult } from './types'

export async function processWiegand(
  mode: WiegandMode,
  input: string,
  decode26Format?: Decode26InputFormat,
): Promise<WiegandResult | null> {
  const trimmedInput = input.trim()
  if (!trimmedInput) {
    return null
  }

  try {
    switch (mode) {
      case 'encode':
        return await encodeWiegand(trimmedInput)
      case 'decode26':
        return await decode26WithFormat(trimmedInput, decode26Format ?? 'decimal')
      case 'decode64':
        return { mode, decoded: (await decode64(trimmedInput)) ?? null }
    }
  } catch (error: unknown) {
    return {
      mode: 'error',
      error: error instanceof Error ? error.message : 'conversion_failed',
    }
  }
}

// anpr-wiegand only exposes decode26(hex), which strips the 2 parity bits from a raw Wiegand26
// value but never computes them. Reconstructing correct parity bits here (same algorithm as the
// library's internal, unexported addParityBits) lets decimal-format input produce an accurate hex.
function popcount(value: number): number {
  const withPairSums = value - ((value >> 1) & 0x55555555)
  const withNibbleSums = (withPairSums & 0x33333333) + ((withPairSums >> 2) & 0x33333333)
  return (((withNibbleSums + (withNibbleSums >> 4)) & 0x0f0f0f0f) * 0x01010101) >> 24
}

function addParityBits(payloadShiftedLeftByOne: number): number {
  const withLeadingParity =
    popcount((payloadShiftedLeftByOne >> 13) & 0x1fff) % 2 !== 0 ? payloadShiftedLeftByOne | (1 << 25) : payloadShiftedLeftByOne
  return popcount((withLeadingParity >> 1) & 0xfff) % 2 === 0 ? withLeadingParity | 1 : withLeadingParity
}

async function decode26WithFormat(input: string, format: Decode26InputFormat): Promise<WiegandDecoded26 | WiegandResult> {
  switch (format) {
    case 'decimal': {
      const asNumber = Number(input)
      if (!/^\d+$/.test(input) || !Number.isInteger(asNumber) || asNumber < 0 || asNumber > 16_777_215) {
        return { mode: 'error', error: 'Invalid decimal value (must be 0-16777215)' }
      }
      const withParityBits = addParityBits(asNumber << 1)
      const hex = (withParityBits >>> 0).toString(16).toUpperCase().padStart(7, '0')
      return { mode: 'decode26', decoded: (await decode26(hex)) ?? null }
    }
    case 'hex':
      return { mode: 'decode26', decoded: (await decode26(input)) ?? null }
    case 'plate': {
      const encoded = await encode26(input)
      if (!encoded) {
        return { mode: 'error', error: 'Could not encode this plate to Wiegand 26-bit' }
      }
      return { mode: 'decode26', decoded: encoded }
    }
  }
}

async function encodeWiegand(input: string): Promise<WiegandEncoded> {
  const [encoded26, encoded64] = await Promise.all([encode26(input), encode64(input)])
  return {
    mode: 'encode',
    encoded26: encoded26 ?? null,
    encoded64: encoded64 ?? null,
  }
}
