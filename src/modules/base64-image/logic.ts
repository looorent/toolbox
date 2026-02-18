import { logger } from '@/utils/logger'

const MIME_MAP: Record<string, string> = {
  '/9j/': 'image/jpeg',
  iVBORw0KGgo: 'image/png',
  R0lGOD: 'image/gif',
  UklGR: 'image/webp',
  PHN2Z: 'image/svg+xml',
  AAABAA: 'image/x-icon',
}

export function detectMime(base64: string): string | null {
  const mime = Object.entries(MIME_MAP).find(([prefix]) => base64.startsWith(prefix))?.[1] ?? null
  logger.debug('Detected MIME type: %s', mime)
  return mime
}

function isValidBase64Prefix(input: string): boolean {
  try {
    atob(input.slice(0, 100))
    return true
  } catch (error) {
    logger.warn('Invalid base64 prefix detected: %o', error)
    return false
  }
}

export function toDataUri(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) {
    return null
  }

  if (trimmed.startsWith('data:image/')) {
    const isValid = trimmed.includes(';base64,')
    if (!isValid) {
      logger.warn('Data URI missing ";base64," separator')
    }
    return isValid ? trimmed : null
  }

  const mime = detectMime(trimmed) ?? 'image/png'

  const result = isValidBase64Prefix(trimmed) ? `data:${mime};base64,${trimmed}` : null

  if (result) {
    logger.debug('Converted input to data URI with MIME: %s', mime)
  }

  return result
}

export function extractBase64(input: string): string {
  const trimmed = input.trim()
  const separator = ';base64,'
  const index = trimmed.indexOf(separator)

  return index !== -1 ? trimmed.slice(index + separator.length) : trimmed
}

export { byteLength as base64ByteSize } from '../base64/logic'

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024

  if (bytes === 0) {
    return '0 B'
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / k ** i
  const decimals = i < 2 ? 1 : 2

  return i === 0 ? `${bytes} B` : `${value.toFixed(decimals)} ${units[i]}`
}
