import { describe, expect, it } from 'vitest'
import { formatDateTimeCompact } from './formatDateTimeCompact'

describe('formatDateTimeCompact', () => {
  it('formats a date as YYYYMMDD_HHmmSS', () => {
    const date = new Date(2026, 2, 3, 14, 5, 9)
    expect(formatDateTimeCompact(date)).toBe('20260303_140509')
  })

  it('zero-pads single-digit months, days, hours, minutes, and seconds', () => {
    const date = new Date(2025, 0, 2, 3, 4, 5)
    expect(formatDateTimeCompact(date)).toBe('20250102_030405')
  })

  it('handles midnight', () => {
    const date = new Date(2026, 11, 31, 0, 0, 0)
    expect(formatDateTimeCompact(date)).toBe('20261231_000000')
  })

  it('handles end of day', () => {
    const date = new Date(2026, 5, 15, 23, 59, 59)
    expect(formatDateTimeCompact(date)).toBe('20260615_235959')
  })
})
