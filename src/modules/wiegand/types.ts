import type { Wiegand26Result } from 'anpr-wiegand'

export type WiegandMode = 'encode' | 'decode26' | 'decode64'

export interface WiegandEncoded {
  mode: 'encode'
  encoded26: Wiegand26Result | null
  encoded64: string | null
}

export interface WiegandDecoded26 {
  mode: 'decode26'
  decoded: Wiegand26Result | null
}

export interface WiegandDecoded64 {
  mode: 'decode64'
  decoded: string | null
}

export interface WiegandError {
  mode: 'error'
  error: string
}

export type WiegandResult = WiegandEncoded | WiegandDecoded26 | WiegandDecoded64 | WiegandError
