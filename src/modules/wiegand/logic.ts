import { decode26, decode64, encode26, encode64 } from 'anpr-wiegand'
import type { WiegandEncoded, WiegandMode, WiegandResult } from './types'

export async function processWiegand(mode: WiegandMode, input: string): Promise<WiegandResult | null> {
  const trimmedInput = input.trim()
  if (!trimmedInput) {
    return null
  }

  try {
    switch (mode) {
      case 'encode':
        return await encodeWiegand(trimmedInput)
      case 'decode26':
        return { mode, decoded: (await decode26(trimmedInput)) ?? null }
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

async function encodeWiegand(input: string): Promise<WiegandEncoded> {
  const [encoded26, encoded64] = await Promise.all([encode26(input), encode64(input)])
  return {
    mode: 'encode',
    encoded26: encoded26 ?? null,
    encoded64: encoded64 ?? null,
  }
}
