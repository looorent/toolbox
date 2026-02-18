import { describe, expect, it } from 'vitest'
import { generateUuid, generateUuids } from './logic'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('generateUuid', () => {
  it('returns a valid v4 UUID', () => {
    expect(generateUuid()).toMatch(UUID_PATTERN)
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

  it('returns all valid v4 UUIDs', () => {
    const uuids = generateUuids(10)
    for (const uuid of uuids) {
      expect(uuid).toMatch(UUID_PATTERN)
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
