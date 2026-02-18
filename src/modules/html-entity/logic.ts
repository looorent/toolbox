import he from 'he'
import type { EntityFormat } from './types'

export function encodeEntities(text: string, format: EntityFormat): string {
  if (!text) {
    return ''
  }

  switch (format) {
    case 'decimal':
      return he.encode(text, { useNamedReferences: false, decimal: true })
    case 'hex':
      return he.encode(text, { useNamedReferences: false, decimal: false })
    case 'named':
      return he.encode(text, { useNamedReferences: true })
  }
}

export function decodeEntities(text: string): string {
  return text ? he.decode(text) : ''
}
