import type { NumberFormats, Radix } from './types'

const EMPTY_FORMATS: NumberFormats = { decimal: '', hex: '', binary: '', octal: '' }

export function convertNumber(value: string, radix: Radix): NumberFormats {
  const cleaned = cleanInput(value, radix)

  if (cleaned === null) {
    return EMPTY_FORMATS
  }

  const parsed = parseInt(cleaned, radix)
  return Number.isNaN(parsed) ? EMPTY_FORMATS : formatNumber(parsed)
}

function cleanInput(value: string, radix: Radix): string | null {
  switch (radix) {
    case 16:
      return value.replace(/^0x/i, '').trim() || null
    case 2:
      return value.replace(/\s/g, '').trim() || null
    case 10:
    case 8:
      return value.trim() || null
  }
}

function formatNumber(parsed: number): NumberFormats {
  return {
    decimal: parsed.toString(10),
    hex: parsed.toString(16).toUpperCase(),
    binary: parsed.toString(2),
    octal: parsed.toString(8),
  }
}
