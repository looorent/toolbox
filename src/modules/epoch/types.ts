export interface EpochResult {
  seconds: number
  milliseconds: number
  iso: string // e.g. "2025-01-15T10:30:00.000Z"
  utc: string // e.g. "Wed, 15 Jan 2025 10:30:00 GMT"
  local: string // e.g. "1/15/2025, 10:30:00 AM" (locale-dependent)
  relative: string // e.g. "2 hours ago"
  timezoneTime: string // e.g. "1/15/2025, 3:30:00 AM EST"
  timezoneOffset: string // e.g. "UTC-05:00"
}

export interface ResultField {
  label: string
  key: string
  value: (result: EpochResult) => string
}
