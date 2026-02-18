import { describe, expect, it } from 'vitest'
import { createColorInstance, getColorFormats, getColorPalette } from './logic'

// ── createColorInstance ──────────────────────────────────────

describe('createColorInstance', () => {
  it('creates instance from hex color', () => {
    expect(createColorInstance('#ff0000')).not.toBeNull()
  })

  it('creates instance from rgb string', () => {
    expect(createColorInstance('rgb(255, 0, 0)')).not.toBeNull()
  })

  it('creates instance from hsl string', () => {
    expect(createColorInstance('hsl(0, 100%, 50%)')).not.toBeNull()
  })

  it('creates instance from named color', () => {
    expect(createColorInstance('red')).not.toBeNull()
  })

  it('creates instance from 3-char hex', () => {
    expect(createColorInstance('#f00')).not.toBeNull()
  })

  it('returns null for invalid color', () => {
    expect(createColorInstance('notacolor')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(createColorInstance('')).toBeNull()
  })
})

// ── getColorFormats ──────────────────────────────────────────

describe('getColorFormats', () => {
  it('returns hex in uppercase', () => {
    const instance = createColorInstance('#3b82f6')
    if (!instance) {
      return
    }
    const formats = getColorFormats(instance)
    expect(formats.hex).toBe('#3B82F6')
  })

  it('returns valid rgb string', () => {
    const instance = createColorInstance('#ff0000')
    if (!instance) {
      return
    }
    const formats = getColorFormats(instance)
    expect(formats.rgb).toContain('rgb')
    expect(formats.rgbValues.r).toBe(255)
    expect(formats.rgbValues.g).toBe(0)
    expect(formats.rgbValues.b).toBe(0)
  })

  it('returns valid hsl string', () => {
    const instance = createColorInstance('#ff0000')
    if (!instance) {
      return
    }
    const formats = getColorFormats(instance)
    expect(formats.hsl).toContain('hsl')
    expect(formats.hslValues.h).toBe(0)
    expect(formats.hslValues.s).toBe(100)
    expect(formats.hslValues.l).toBe(50)
  })

  it('returns valid hsv string', () => {
    const instance = createColorInstance('#ff0000')
    if (!instance) {
      return
    }
    const formats = getColorFormats(instance)
    expect(formats.hsv).toContain('hsv')
  })

  it('returns valid cmyk string', () => {
    const instance = createColorInstance('#ff0000')
    if (!instance) {
      return
    }
    const formats = getColorFormats(instance)
    expect(formats.cmyk).toContain('cmyk')
  })

  it('detects dark colors', () => {
    const instance = createColorInstance('#000000')
    if (!instance) {
      return
    }
    const formats = getColorFormats(instance)
    expect(formats.luminance).toBe('Dark')
    expect(formats.contrastColor).toBe('#ffffff')
  })

  it('detects light colors', () => {
    const instance = createColorInstance('#ffffff')
    if (!instance) {
      return
    }
    const formats = getColorFormats(instance)
    expect(formats.luminance).toBe('Light')
    expect(formats.contrastColor).toBe('#000000')
  })
})

// ── getColorPalette ──────────────────────────────────────────

describe('getColorPalette', () => {
  it('returns a complementary color', () => {
    const instance = createColorInstance('#3b82f6')
    if (!instance) {
      return
    }
    const palette = getColorPalette(instance)
    expect(palette.complementary).toBeTruthy()
    expect(palette.complementary).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('returns triadic colors', () => {
    const instance = createColorInstance('#3b82f6')
    if (!instance) {
      return
    }
    const palette = getColorPalette(instance)
    expect(palette.triadic.length).toBeGreaterThan(0)
    for (const color of palette.triadic) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('returns analogous colors', () => {
    const instance = createColorInstance('#3b82f6')
    if (!instance) {
      return
    }
    const palette = getColorPalette(instance)
    expect(palette.analogous.length).toBeGreaterThan(0)
  })

  it('returns split-complementary colors', () => {
    const instance = createColorInstance('#3b82f6')
    if (!instance) {
      return
    }
    const palette = getColorPalette(instance)
    expect(palette.splitComplementary.length).toBeGreaterThan(0)
  })

  it('returns 9 shades', () => {
    const instance = createColorInstance('#3b82f6')
    if (!instance) {
      return
    }
    const palette = getColorPalette(instance)
    expect(palette.shades).toHaveLength(9)
    for (const shade of palette.shades) {
      expect(shade).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
