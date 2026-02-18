export interface XorResult {
  bytes?: number[]
  checksum?: number
  hex?: string
  binary?: string
  decimal?: number
  bytesHex?: string
  error?: XorError | undefined
}

export type XorInputFormat = 'hex' | 'ascii'

export type XorError = 'invalid_hex_string' | 'no_data_to_process'
