import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { relativeTime } from './relativeTime'

describe('relativeTime', () => {
  const nowUnix = new Date('2030-06-15T12:00:00Z').getTime() / 1000

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for timestamps less than a minute in the past', () => {
    expect(relativeTime(nowUnix - 30)).toBe('just now')
  })

  it('returns "in less than a minute" for timestamps less than a minute in the future', () => {
    expect(relativeTime(nowUnix + 30)).toBe('in less than a minute')
  })

  it('returns minutes ago for past timestamps under an hour', () => {
    expect(relativeTime(nowUnix - 300)).toBe('5m ago')
  })

  it('returns in minutes for future timestamps under an hour', () => {
    expect(relativeTime(nowUnix + 300)).toBe('in 5m')
  })

  it('returns hours ago for past timestamps under a day', () => {
    expect(relativeTime(nowUnix - 7200)).toBe('2h ago')
  })

  it('returns in hours for future timestamps under a day', () => {
    expect(relativeTime(nowUnix + 7200)).toBe('in 2h')
  })

  it('returns days ago for past timestamps over a day', () => {
    expect(relativeTime(nowUnix - 172800)).toBe('2d ago')
  })

  it('returns in days for future timestamps over a day', () => {
    expect(relativeTime(nowUnix + 172800)).toBe('in 2d')
  })

  it('floors partial minutes', () => {
    expect(relativeTime(nowUnix - 90)).toBe('1m ago')
  })

  it('floors partial hours', () => {
    expect(relativeTime(nowUnix - 5400)).toBe('1h ago')
  })

  it('floors partial days', () => {
    expect(relativeTime(nowUnix - 129600)).toBe('1d ago')
  })
})
