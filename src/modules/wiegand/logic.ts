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

async function decode26WithFormat(input: string, format: Decode26InputFormat): Promise<WiegandDecoded26 | WiegandResult> {
  switch (format) {
    case 'decimal': {
      const asNumber = Number(input)
      if (!/^\d+$/.test(input) || !Number.isInteger(asNumber) || asNumber < 0 || asNumber > 16_777_215) {
        return { mode: 'error', error: 'Invalid decimal value (must be 0–16777215)' }
      }
      const hex = asNumber.toString(16).toUpperCase()
      return { mode: 'decode26', decoded: (await decode26(hex)) ?? null }
    }
    case 'hex': {
      return { mode: 'decode26', decoded: (await decode26(input)) ?? null }
    }
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
