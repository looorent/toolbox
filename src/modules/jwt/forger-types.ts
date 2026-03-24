export type SigningAlgorithm =
  | 'none'
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'ES256'
  | 'ES384'
  | 'ES512'
  | 'PS256'
  | 'PS384'
  | 'PS512'
  | 'EdDSA'

export type AlgorithmFamily = 'none' | 'hmac' | 'rsa' | 'ecdsa' | 'rsa-pss' | 'eddsa'

export interface AlgorithmInfo {
  value: SigningAlgorithm
  label: string
  family: AlgorithmFamily
  description: string
}

export interface StandardClaimDefinition {
  key: string
  label: string
  description: string
  example: string
  inputType: 'text' | 'timestamp' | 'array' | 'json'
}

export interface ClaimEntry {
  key: string
  value: string
  enabled: boolean
}

export interface HeaderClaimDefinition {
  key: string
  label: string
  description: string
  placeholder: string
}

export interface TokenPreset {
  label: string
  description: string
  algorithm: SigningAlgorithm
  claims: { key: string; value: string; enabled: boolean }[]
}

export interface LifetimeShortcut {
  label: string
  seconds: number
}
