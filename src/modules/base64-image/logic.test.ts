import { describe, expect, it } from 'vitest'
import { detectMime, extractBase64, formatBytes, toDataUri } from './logic'

describe('detectMime', () => {
  it('detects JPEG from magic bytes', () => {
    expect(detectMime('/9j/4AAQ')).toBe('image/jpeg')
  })

  it('detects PNG from magic bytes', () => {
    expect(detectMime('iVBORw0KGgoAAAANSUhEUg')).toBe('image/png')
  })

  it('detects GIF from magic bytes', () => {
    expect(detectMime('R0lGODlh')).toBe('image/gif')
  })

  it('detects WebP from magic bytes', () => {
    expect(detectMime('UklGRiAA')).toBe('image/webp')
  })

  it('detects SVG from magic bytes', () => {
    expect(detectMime('PHN2ZyB4')).toBe('image/svg+xml')
  })

  it('detects ICO from magic bytes', () => {
    expect(detectMime('AAABAAEAICAQAAEABADo')).toBe('image/x-icon')
  })

  it('returns null for unrecognized content', () => {
    expect(detectMime('AAAAAAAAAA')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(detectMime('')).toBeNull()
  })
})

describe('toDataUri', () => {
  it('returns null for empty string', () => {
    expect(toDataUri('')).toBeNull()
  })

  it('returns null for whitespace-only string', () => {
    expect(toDataUri('   ')).toBeNull()
  })

  it('passes through valid data URIs unchanged', () => {
    const uri = 'data:image/png;base64,iVBORw0KGgo'
    expect(toDataUri(uri)).toBe(uri)
  })

  it('returns null for data URI without base64 encoding', () => {
    expect(toDataUri('data:image/png,rawdata')).toBeNull()
  })

  it('builds data URI from raw PNG base64', () => {
    const result = toDataUri('iVBORw0KGgoAAAA')
    expect(result).toBe('data:image/png;base64,iVBORw0KGgoAAAA')
  })

  it('builds data URI from raw JPEG base64', () => {
    const result = toDataUri('/9j/4AAQSkZJRg')
    expect(result).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRg')
  })

  it('falls back to PNG for valid but unrecognized base64', () => {
    const validBase64 = btoa('some binary data')
    const result = toDataUri(validBase64)
    expect(result).toBe(`data:image/png;base64,${validBase64}`)
  })

  it('returns null for invalid base64', () => {
    expect(toDataUri('not valid base64 !!!')).toBeNull()
  })

  it('trims whitespace from input', () => {
    const uri = 'data:image/png;base64,iVBORw0KGgo'
    expect(toDataUri(`  ${uri}  `)).toBe(uri)
  })
})

describe('extractBase64', () => {
  it('extracts base64 from data URI', () => {
    expect(extractBase64('data:image/png;base64,iVBORw0KGgo')).toBe('iVBORw0KGgo')
  })

  it('returns raw string when no data URI prefix', () => {
    expect(extractBase64('iVBORw0KGgo')).toBe('iVBORw0KGgo')
  })

  it('trims whitespace', () => {
    expect(extractBase64('  iVBORw0KGgo  ')).toBe('iVBORw0KGgo')
  })

  it('handles empty string', () => {
    expect(extractBase64('')).toBe('')
  })
})

describe('formatBytes', () => {
  it('formats bytes under 1 KB', () => {
    expect(formatBytes(500)).toBe('500 B')
  })

  it('formats bytes as KB', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('formats bytes as MB', () => {
    expect(formatBytes(1_572_864)).toBe('1.50 MB')
  })

  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats exactly 1 KB', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
  })

  it('formats exactly 1 MB', () => {
    expect(formatBytes(1_048_576)).toBe('1.00 MB')
  })
})
