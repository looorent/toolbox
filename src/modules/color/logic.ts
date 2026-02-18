import { type Colord, colord, extend } from 'colord'
import a11yPlugin from 'colord/plugins/a11y'
import cmykPlugin from 'colord/plugins/cmyk'
import harmoniesPlugin from 'colord/plugins/harmonies'
import namesPlugin from 'colord/plugins/names'
import type { ColorFormats, ColorPalette } from './types'

extend([namesPlugin, harmoniesPlugin, a11yPlugin, cmykPlugin])

export function createColorInstance(input: string): Colord | null {
  const instance = colord(input)
  return instance.isValid() ? instance : null
}

export function getColorFormats(color: Colord): ColorFormats {
  const rgb = color.toRgb()
  const hsl = color.toHsl()
  const hsv = color.toHsv()
  const cmyk = color.toCmyk()

  return {
    hex: color.toHex().toUpperCase(),
    rgb: color.toRgbString(),
    rgbValues: rgb,
    hsl: color.toHslString(),
    hslValues: hsl,
    hsv: `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`,
    hsvValues: hsv,
    cmyk: `cmyk(${Math.round(cmyk.c)}%, ${Math.round(cmyk.m)}%, ${Math.round(cmyk.y)}%, ${Math.round(cmyk.k)}%)`,
    cmykValues: cmyk,
    luminance: color.isDark() ? 'Dark' : 'Light',
    contrastColor: color.isDark() ? '#ffffff' : '#000000',
  }
}

export function getColorPalette(color: Colord): ColorPalette {
  return {
    complementary: color.harmonies('complementary')[0]?.toHex() ?? color.toHex(),
    triadic: color.harmonies('triadic').map(harmony => harmony.toHex()),
    analogous: color.harmonies('analogous').map(harmony => harmony.toHex()),
    splitComplementary: color.harmonies('split-complementary').map(harmony => harmony.toHex()),
    shades: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map(l => color.lighten(l - 0.5).toHex()),
  }
}
