import { MAX_WIEGAND26_DECIMAL, RANGE_SIZE } from '@shared/modules/wiegand/constants'

export function isValidWiegand26(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= MAX_WIEGAND26_DECIMAL
}

export function computeR2Key(country: string, wiegand26: number): string {
  const padLength = String(MAX_WIEGAND26_DECIMAL).length
  const rangeIndex = Math.floor(wiegand26 / RANGE_SIZE)
  const start = rangeIndex * RANGE_SIZE
  const end = Math.min((rangeIndex + 1) * RANGE_SIZE - 1, MAX_WIEGAND26_DECIMAL)
  const filename = `${String(start).padStart(padLength, '0')}-${String(end).padStart(padLength, '0')}_${country}_wiegand_to_text.parquet`
  return `${country}/${filename}`
}
