export type UuidVersion = 'v4' | 'v7'

export interface UuidV7Info {
  timestamp: number
  date: Date
  iso: string
  utc: string
  local: string
}
