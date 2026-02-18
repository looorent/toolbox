export type DecodedJwt = DecodedJwtError | DecodedJwtSuccess

export interface DecodedJwtError {
  kind: 'error'
  message: string
}

export interface DecodedJwtSuccess {
  kind: 'success'
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string | null
  parts: [string, string, string]
  expStatus: 'valid' | 'expired' | 'not-yet' | null
  expInfo: string | null
}
