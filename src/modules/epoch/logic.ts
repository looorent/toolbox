import { relativeTime } from '@utils/relativeTime'

import type { EpochResult, ResultField } from './types'

function formatInTimezone(date: Date, timeZone: string): string {
  return date.toLocaleString(undefined, {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })
}

function computeUtcOffset(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  }).formatToParts(date)

  const timezonePart = parts.find(part => part.type === 'timeZoneName')

  if (timezonePart) {
    return timezonePart.value
  } else {
    return ''
  }
}

function buildResult(date: Date, timeZone: string): EpochResult {
  const milliseconds = date.getTime()
  return {
    seconds: Math.floor(milliseconds / 1000),
    milliseconds,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    relative: relativeTime(date),
    timezoneTime: formatInTimezone(date, timeZone),
    timezoneOffset: computeUtcOffset(date, timeZone),
  }
}

export function millisecondsToDate(milliseconds: number, timeZone: string): EpochResult | null {
  if (!Number.isFinite(milliseconds)) {
    return null
  }

  const date = new Date(milliseconds)
  return Number.isNaN(date.getTime()) ? null : buildResult(date, timeZone)
}

export function dateToTimestamp(date: Date, timeZone: string): EpochResult {
  return buildResult(date, timeZone)
}

export function parseHumanDate(input: string, timeZone: string): EpochResult | null {
  const trimmed = input.trim()

  if (!trimmed) {
    return null
  }

  const date = new Date(trimmed)
  return Number.isNaN(date.getTime()) ? null : buildResult(date, timeZone)
}

export function localTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function allTimeZones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone')
  } catch {
    return COMMON_TIMEZONES
  }
}

export const RESULT_FIELDS: ResultField[] = [
  { label: 'ISO 8601', key: 'iso', value: result => result.iso },
  { label: 'UTC', key: 'utc', value: result => result.utc },
  { label: 'Local Time', key: 'local', value: result => result.local },
  { label: 'Relative', key: 'relative', value: result => result.relative },
]

export function buildTimezoneField(timeZone: string): ResultField {
  return {
    label: timeZone,
    key: 'tz',
    value: result => `${result.timezoneTime}  (${result.timezoneOffset})`,
  }
}

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'Europe/Brussels',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Zurich',
  'Europe/Moscow',
  'Europe/Istanbul',
  'Africa/Cairo',
  'Africa/Lagos',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
]
