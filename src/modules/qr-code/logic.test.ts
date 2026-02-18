import { describe, expect, it } from 'vitest'
import { generateQrDataUri } from './logic'

describe('generateQrDataUri', () => {
  it('returns a PNG data URI', async () => {
    const dataUri = await generateQrDataUri('hello', 'M', 200)
    expect(dataUri).toMatch(/^data:image\/png;base64,/)
  })

  it('returns valid base64 content', async () => {
    const dataUri = await generateQrDataUri('test', 'M', 200)
    const base64 = dataUri.split(',')[1] ?? ''
    expect(() => atob(base64)).not.toThrow()
  })

  it('produces different output for different inputs', async () => {
    const first = await generateQrDataUri('hello', 'M', 200)
    const second = await generateQrDataUri('world', 'M', 200)
    expect(first).not.toBe(second)
  })

  it('produces different output for different error correction levels', async () => {
    const low = await generateQrDataUri('test', 'L', 200)
    const high = await generateQrDataUri('test', 'H', 200)
    expect(low).not.toBe(high)
  })

  it('works with all error correction levels', async () => {
    for (const level of ['L', 'M', 'Q', 'H'] as const) {
      const dataUri = await generateQrDataUri('test', level, 200)
      expect(dataUri).toMatch(/^data:image\/png;base64,/)
    }
  })

  it('handles long text input', async () => {
    const longText = 'a'.repeat(500)
    const dataUri = await generateQrDataUri(longText, 'L', 200)
    expect(dataUri).toMatch(/^data:image\/png;base64,/)
  })

  it('handles URL input', async () => {
    const dataUri = await generateQrDataUri('https://example.com/path?q=hello&lang=en', 'M', 300)
    expect(dataUri).toMatch(/^data:image\/png;base64,/)
  })

  it('handles unicode input', async () => {
    const dataUri = await generateQrDataUri('こんにちは世界', 'M', 200)
    expect(dataUri).toMatch(/^data:image\/png;base64,/)
  })

  it('rejects empty string', async () => {
    await expect(generateQrDataUri('', 'M', 200)).rejects.toThrow()
  })
})
