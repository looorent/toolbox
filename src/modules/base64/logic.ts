import { logger } from '@/utils/logger'
import type { Base64Variant } from './types'

export function encode(text: string, variant: Base64Variant): string {
  if (!text) {
    return ''
  }

  try {
    const bytes = new TextEncoder().encode(text)
    const binary = Array.from(bytes, byte => String.fromCodePoint(byte)).join('')
    const standard = btoa(binary)

    logger.debug('Encoded %d characters to base64 (%s)', text.length, variant)

    return variant === 'url-safe' ? standard.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : standard
  } catch (error) {
    logger.error('Failed to encode text to base64: %o', error)
    return ''
  }
}

const normalizeBase64 = (base64: string, variant: Base64Variant): string => {
  if (variant === 'standard') {
    return base64
  }

  const replaced = base64.replace(/-/g, '+').replace(/_/g, '/')
  const pad = replaced.length % 4

  return pad === 0 ? replaced : replaced + '='.repeat(4 - pad)
}

export function decode(base64: string, variant: Base64Variant): { text: string; error: boolean } {
  if (!base64) {
    return { text: '', error: false }
  }

  try {
    const input = normalizeBase64(base64, variant)
    const binary = atob(input)
    const bytes = Uint8Array.from(binary, char => char.codePointAt(0) ?? 0)

    logger.debug('Decoded %d base64 characters (%s)', base64.length, variant)

    return {
      text: new TextDecoder('utf-8', { fatal: true }).decode(bytes),
      error: false,
    }
  } catch (error) {
    logger.warn('Failed to decode base64 string: %s...', base64.slice(0, 20), error)
    return { text: '', error: true }
  }
}

export function byteLength(base64: string): number {
  if (!base64) {
    return 0
  }

  const clean = base64.replace(/=+$/, '')
  return Math.floor((clean.length * 3) / 4)
}
