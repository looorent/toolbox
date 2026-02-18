import { describe, expect, it } from 'vitest'
import { allTimeZones, buildTimezoneField, dateToTimestamp, localTimeZone, millisecondsToDate, parseHumanDate } from './logic'

describe('millisecondsToDate', () => {
  it('converts milliseconds to a valid EpochResult', () => {
    const result = millisecondsToDate(1700000000000, 'UTC')
    expect(result).not.toBeNull()
    expect(result?.seconds).toBe(1700000000)
    expect(result?.milliseconds).toBe(1700000000000)
    expect(result?.iso).toBe('2023-11-14T22:13:20.000Z')
  })

  it('returns null for non-finite input', () => {
    expect(millisecondsToDate(Number.NaN, 'UTC')).toBeNull()
    expect(millisecondsToDate(Number.POSITIVE_INFINITY, 'UTC')).toBeNull()
  })

  it('includes timezone info in the result', () => {
    const result = millisecondsToDate(1700000000000, 'America/New_York')
    expect(result).not.toBeNull()
    expect(result?.timezoneOffset).toMatch(/UTC|GMT/)
  })

  it('handles zero milliseconds (Unix epoch)', () => {
    const result = millisecondsToDate(0, 'UTC')
    expect(result).not.toBeNull()
    expect(result?.seconds).toBe(0)
    expect(result?.iso).toBe('1970-01-01T00:00:00.000Z')
  })

  it('handles negative milliseconds (before epoch)', () => {
    const result = millisecondsToDate(-86400000, 'UTC')
    expect(result).not.toBeNull()
    expect(result?.iso).toBe('1969-12-31T00:00:00.000Z')
  })
})

describe('parseHumanDate', () => {
  it('parses an ISO 8601 date string', () => {
    const result = parseHumanDate('2025-01-15T10:30:00Z', 'UTC')
    expect(result).not.toBeNull()
    expect(result?.iso).toBe('2025-01-15T10:30:00.000Z')
  })

  it('parses a simpler date string', () => {
    const result = parseHumanDate('2025-01-15', 'UTC')
    expect(result).not.toBeNull()
    expect(result?.seconds).toBeGreaterThan(0)
  })

  it('returns null for empty string', () => {
    expect(parseHumanDate('', 'UTC')).toBeNull()
  })

  it('returns null for whitespace-only string', () => {
    expect(parseHumanDate('   ', 'UTC')).toBeNull()
  })

  it('returns null for invalid date string', () => {
    expect(parseHumanDate('not-a-date', 'UTC')).toBeNull()
  })

  it('trims whitespace before parsing', () => {
    const result = parseHumanDate('  2025-01-15T10:30:00Z  ', 'UTC')
    expect(result).not.toBeNull()
    expect(result?.iso).toBe('2025-01-15T10:30:00.000Z')
  })
})

describe('dateToTimestamp', () => {
  it('converts a Date object to an EpochResult', () => {
    const date = new Date('2025-01-15T10:30:00Z')
    const result = dateToTimestamp(date, 'UTC')
    expect(result.iso).toBe('2025-01-15T10:30:00.000Z')
    expect(result.seconds).toBe(Math.floor(date.getTime() / 1000))
    expect(result.milliseconds).toBe(date.getTime())
  })

  it('includes relative time', () => {
    const date = new Date()
    const result = dateToTimestamp(date, 'UTC')
    expect(result.relative).toMatch(/just now|in less than a minute/)
  })

  it('includes UTC string', () => {
    const date = new Date('2025-06-01T00:00:00Z')
    const result = dateToTimestamp(date, 'UTC')
    expect(result.utc).toContain('Jun')
  })
})

describe('localTimeZone', () => {
  it('returns a non-empty string', () => {
    const tz = localTimeZone()
    expect(tz).toBeTruthy()
    expect(typeof tz).toBe('string')
  })
})

describe('allTimeZones', () => {
  it('returns an array of timezone strings', () => {
    const zones = allTimeZones()
    expect(Array.isArray(zones)).toBe(true)
    expect(zones.length).toBeGreaterThan(0)
  })

  it('includes major timezone regions', () => {
    const zones = allTimeZones()
    expect(zones.some(zone => zone.startsWith('America/'))).toBe(true)
    expect(zones.some(zone => zone.startsWith('Europe/'))).toBe(true)
    expect(zones.some(zone => zone.startsWith('Asia/'))).toBe(true)
  })

  it('includes common timezones', () => {
    const zones = allTimeZones()
    expect(zones).toContain('America/New_York')
    expect(zones).toContain('Europe/London')
    expect(zones).toContain('Asia/Tokyo')
  })
})

describe('buildTimezoneField', () => {
  it('creates a field with the timezone as label', () => {
    const field = buildTimezoneField('America/New_York')
    expect(field.label).toBe('America/New_York')
    expect(field.key).toBe('tz')
  })

  it('formats the value with time and offset', () => {
    const sampleResult = millisecondsToDate(1700000000000, 'America/New_York')
    if (!sampleResult) {
      return
    }
    const field = buildTimezoneField('America/New_York')
    const value = field.value(sampleResult)
    expect(value).toContain(sampleResult.timezoneTime)
    expect(value).toContain(sampleResult.timezoneOffset)
  })
})
