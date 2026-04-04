import type { UuidV7Info, UuidVersion } from './types'

export function generateUuidV4(): string {
  return crypto.randomUUID()
}

export function generateUuidV7(): string {
  const timestamp = Date.now()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  // Encode 48-bit millisecond timestamp into bytes 0–5
  bytes[0] = (timestamp / 2 ** 40) & 0xff
  bytes[1] = (timestamp / 2 ** 32) & 0xff
  bytes[2] = (timestamp / 2 ** 24) & 0xff
  bytes[3] = (timestamp / 2 ** 16) & 0xff
  bytes[4] = (timestamp / 2 ** 8) & 0xff
  bytes[5] = timestamp & 0xff

  // Set version 7 (bits 48–51)
  bytes[6] = (bytes[6] & 0x0f) | 0x70
  // Set variant 10 (bits 64–65)
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  return formatUuidBytes(bytes)
}

function formatUuidBytes(bytes: Uint8Array): string {
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function generateUuid(version: UuidVersion = 'v4'): string {
  if (version === 'v7') {
    return generateUuidV7()
  } else {
    return generateUuidV4()
  }
}

export function generateUuids(count: number, version: UuidVersion = 'v4'): string[] {
  return Array.from({ length: Math.max(1, count) }, () => generateUuid(version))
}

export function detectUuidVersion(uuid: string): UuidVersion | null {
  const cleaned = uuid.replace(/-/g, '')
  if (cleaned.length !== 32) {
    return null
  }

  const versionChar = cleaned[12]
  if (versionChar === '4') {
    return 'v4'
  } else if (versionChar === '7') {
    return 'v7'
  } else {
    return null
  }
}

export function extractV7Timestamp(uuid: string): UuidV7Info | null {
  const cleaned = uuid.replace(/-/g, '').toLowerCase()
  if (cleaned.length !== 32 || cleaned[12] !== '7') {
    return null
  }

  const timestampHex = cleaned.slice(0, 12)
  const timestamp = Number.parseInt(timestampHex, 16)

  if (Number.isNaN(timestamp) || timestamp < 0) {
    return null
  }

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return {
    timestamp,
    date,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
  }
}

export function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}
