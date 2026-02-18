import type { HslaColor, HsvaColor, RgbaColor } from 'colord'

interface CmykaColor {
  c: number
  m: number
  y: number
  k: number
  a: number
}

export interface ColorFormats {
  hex: string
  rgb: string
  rgbValues: RgbaColor
  hsl: string
  hslValues: HslaColor
  hsv: string
  hsvValues: HsvaColor
  cmyk: string
  cmykValues: CmykaColor
  luminance: 'Dark' | 'Light'
  contrastColor: '#ffffff' | '#000000'
}

export interface ColorPalette {
  complementary: string
  triadic: string[]
  analogous: string[]
  splitComplementary: string[]
  shades: string[]
}
