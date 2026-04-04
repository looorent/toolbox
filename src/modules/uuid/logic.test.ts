import { describe, expect, it } from 'vitest'
import { detectUuidVersion, extractV7Timestamp, generateUuid, generateUuidV7, generateUuids, isValidUuid } from './logic'

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('generateUuid v4', () => {
  it('returns a valid v4 UUID', () => {
    expect(generateUuid('v4')).toMatch(UUID_V4_PATTERN)
  })

  it('defaults to v4', () => {
    expect(generateUuid()).toMatch(UUID_V4_PATTERN)
  })

  it('returns unique values on successive calls', () => {
    const first = generateUuid()
    const second = generateUuid()
    expect(first).not.toBe(second)
  })

  it('returns a lowercase string', () => {
    const uuid = generateUuid()
    expect(uuid).toBe(uuid.toLowerCase())
  })

  it('has the correct length', () => {
    expect(generateUuid()).toHaveLength(36)
  })
})

describe('generateUuid v7', () => {
  it('returns a valid v7 UUID', () => {
    expect(generateUuid('v7')).toMatch(UUID_V7_PATTERN)
  })

  it('returns unique values on successive calls', () => {
    const first = generateUuid('v7')
    const second = generateUuid('v7')
    expect(first).not.toBe(second)
  })

  it('returns a lowercase string', () => {
    const uuid = generateUuid('v7')
    expect(uuid).toBe(uuid.toLowerCase())
  })

  it('has the correct length', () => {
    expect(generateUuid('v7')).toHaveLength(36)
  })

  it('embeds a timestamp close to now', () => {
    const before = Date.now()
    const uuid = generateUuidV7()
    const after = Date.now()

    const info = extractV7Timestamp(uuid)
    expect(info).not.toBeNull()
    expect(info!.timestamp).toBeGreaterThanOrEqual(before)
    expect(info!.timestamp).toBeLessThanOrEqual(after)
  })
})

describe('generateUuids', () => {
  it('returns the requested number of UUIDs', () => {
    expect(generateUuids(5)).toHaveLength(5)
  })

  it('returns at least 1 UUID when count is 0', () => {
    expect(generateUuids(0)).toHaveLength(1)
  })

  it('returns at least 1 UUID when count is negative', () => {
    expect(generateUuids(-3)).toHaveLength(1)
  })

  it('returns all valid v4 UUIDs by default', () => {
    const uuids = generateUuids(10)
    for (const uuid of uuids) {
      expect(uuid).toMatch(UUID_V4_PATTERN)
    }
  })

  it('returns all valid v7 UUIDs when requested', () => {
    const uuids = generateUuids(10, 'v7')
    for (const uuid of uuids) {
      expect(uuid).toMatch(UUID_V7_PATTERN)
    }
  })

  it('returns all unique UUIDs', () => {
    const uuids = generateUuids(100)
    const uniqueSet = new Set(uuids)
    expect(uniqueSet.size).toBe(100)
  })

  it('returns exactly 1 UUID when count is 1', () => {
    expect(generateUuids(1)).toHaveLength(1)
  })
})

describe('detectUuidVersion', () => {
  it('detects v4', () => {
    expect(detectUuidVersion('550e8400-e29b-41d4-a716-446655440000')).toBe('v4')
  })

  it('detects v7', () => {
    expect(detectUuidVersion('01912734-5678-7abc-8def-0123456789ab')).toBe('v7')
  })

  it('returns null for invalid UUID', () => {
    expect(detectUuidVersion('not-a-uuid')).toBeNull()
  })

  it('returns null for unsupported version', () => {
    expect(detectUuidVersion('550e8400-e29b-11d4-a716-446655440000')).toBeNull()
  })
})

describe('extractV7Timestamp', () => {
  it('extracts timestamp from a generated v7 UUID', () => {
    const before = Date.now()
    const uuid = generateUuidV7()
    const after = Date.now()

    const info = extractV7Timestamp(uuid)
    expect(info).not.toBeNull()
    expect(info!.timestamp).toBeGreaterThanOrEqual(before)
    expect(info!.timestamp).toBeLessThanOrEqual(after)
    expect(info!.iso).toBeTruthy()
    expect(info!.utc).toBeTruthy()
    expect(info!.local).toBeTruthy()
  })

  it('returns null for a v4 UUID', () => {
    expect(extractV7Timestamp(generateUuid('v4'))).toBeNull()
  })

  it('returns null for an invalid string', () => {
    expect(extractV7Timestamp('invalid')).toBeNull()
  })

  it('extracts a known timestamp', () => {
    // Timestamp 0x017F22E279B0 = 1645567608240 ms = 2022-02-22T22:26:48.240Z
    const uuid = '017f22e2-79b0-7000-8000-000000000000'
    const info = extractV7Timestamp(uuid)
    expect(info).not.toBeNull()
    expect(info!.timestamp).toBe(0x017f22e279b0)
    expect(info!.date.getUTCFullYear()).toBe(2022)
  })
})

describe('isValidUuid', () => {
  it('validates correct UUIDs', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('validates case-insensitively', () => {
    expect(isValidUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
  })

  it('rejects invalid strings', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false)
    expect(isValidUuid('')).toBe(false)
  })
})
