import { relativeTime } from '@utils/relativeTime'
import type { DecodedJwt } from './types'

export const CLAIM_LABELS: Record<string, string> = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  exp: 'Expiration Time',
  nbf: 'Not Before',
  iat: 'Issued At',
  jti: 'JWT ID',
  name: 'Name',
  email: 'Email',
  azp: 'Authorized Party',
  scope: 'Scope',
  roles: 'Roles',
  permissions: 'Permissions',
  nonce: 'Nonce',
  at_hash: 'Access Token Hash',
  c_hash: 'Code Hash',
  auth_time: 'Authentication Time',
  amr: 'Authentication Methods',
  typ: 'Token Type',
  sid: 'Session ID',
  org_id: 'Organization ID',
}

export const TIMESTAMP_CLAIMS = new Set(['exp', 'nbf', 'iat', 'auth_time'])

export const ALG_LABELS: Record<string, string> = {
  HS256: 'HMAC SHA-256',
  HS384: 'HMAC SHA-384',
  HS512: 'HMAC SHA-512',
  RS256: 'RSA SHA-256',
  RS384: 'RSA SHA-384',
  RS512: 'RSA SHA-512',
  ES256: 'ECDSA SHA-256',
  ES384: 'ECDSA SHA-384',
  ES512: 'ECDSA SHA-512',
  PS256: 'RSA-PSS SHA-256',
  PS384: 'RSA-PSS SHA-384',
  PS512: 'RSA-PSS SHA-512',
  EdDSA: 'EdDSA',
}

export const HEADER_LABELS: Record<string, string> = {
  alg: 'Algorithm',
  typ: 'Type',
  kid: 'Key ID',
  jku: 'JWK Set URL',
  jwk: 'JSON Web Key',
  x5u: 'X.509 URL',
  x5c: 'X.509 Chain',
  x5t: 'X.509 Thumbprint',
  cty: 'Content Type',
}

export function decodeJwt(token: string): DecodedJwt | null {
  if (!token.trim()) {
    return null
  }

  try {
    const raw = token.trim()
    const parts = raw.split('.')

    if (parts.length < 2 || !parts[0] || !parts[1]) {
      return { kind: 'error', message: 'Invalid JWT: expected at least 2 non-empty parts separated by dots' }
    }

    const header = JSON.parse(base64UrlDecode(parts[0])) as Record<string, unknown>
    const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>
    const { expStatus, expInfo } = computeExpiration(payload)

    return {
      kind: 'success',
      header,
      payload,
      signature: parts[2] || null,
      parts: [parts[0], parts[1], parts[2] ?? ''],
      expStatus,
      expInfo,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { kind: 'error', message: `Failed to decode: ${message}` }
  }
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })
}

export function formatClaimValue(key: string, value: unknown): string {
  if (TIMESTAMP_CLAIMS.has(key) && typeof value === 'number') {
    return `${formatTimestamp(value)} (${relativeTime(value)})`
  } else if (Array.isArray(value)) {
    return value.join(', ')
  } else if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  } else {
    return String(value)
  }
}

export function formatHeaderValue(key: string, value: unknown): string {
  if (key === 'alg' && typeof value === 'string') {
    const label = ALG_LABELS[value]
    return label ? `${value} (${label})` : String(value)
  } else if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  } else {
    return String(value)
  }
}

export function rawClaimValue(value: unknown): string {
  return typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)
}

interface ExpirationInfo {
  expStatus: 'valid' | 'expired' | 'not-yet' | null
  expInfo: string | null
}

function computeExpiration(payload: Record<string, unknown>): ExpirationInfo {
  if (!payload.exp) {
    return { expStatus: null, expInfo: null }
  }

  const now = Date.now() / 1000
  const exp = payload.exp as number

  if (payload.nbf && now < (payload.nbf as number)) {
    return {
      expStatus: 'not-yet',
      expInfo: `Not yet valid (starts ${formatTimestamp(payload.nbf as number)})`,
    }
  } else if (now > exp) {
    return {
      expStatus: 'expired',
      expInfo: `Expired ${relativeTime(exp)} (${formatTimestamp(exp)})`,
    }
  } else {
    return {
      expStatus: 'valid',
      expInfo: `Valid for ${relativeTime(exp).replace('in ', '')}`,
    }
  }
}

export const SAMPLE_JWT = [
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImFiYy0xMjMifQ',
  'eyJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJzdWIiOiIxMjM0NTY3ODkwIiwiYXVkIjoiaHR0cHM6Ly9hcGkuZXhhbXBsZS5jb20iLCJleHAiOjQxMDI0NDQ4MDAsImlhdCI6MTcwMDAwMDAwMCwibmJmIjoxNzAwMDAwMDAwLCJuYW1lIjoiQWRhIExvdmVsYWNlIiwiZW1haWwiOiJhZGFAZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJhZG1pbiIsImVkaXRvciJdLCJqdGkiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAifQ',
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
].join('.')

function base64UrlDecode(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, char => char.codePointAt(0) ?? 0)
  return new TextDecoder().decode(bytes)
}
