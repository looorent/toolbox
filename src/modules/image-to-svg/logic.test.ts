import { describe, expect, it, vi } from 'vitest'
import { convertToSvg, findActivePreset, getDefaultParams, presets } from './logic'
import type { ConversionParams } from './types'

vi.mock('./wasm', () => ({
  runVtracerConversion: vi.fn(),
}))

import { runVtracerConversion } from './wasm'

const mockedRunVtracerConversion = vi.mocked(runVtracerConversion)

describe('getDefaultParams', () => {
  it('returns a fresh object each time', () => {
    const first = getDefaultParams()
    const second = getDefaultParams()
    expect(first).toEqual(second)
    expect(first).not.toBe(second)
  })

  it('returns spline mode by default', () => {
    expect(getDefaultParams().mode).toBe('spline')
  })

  it('returns color clustering by default', () => {
    expect(getDefaultParams().clusteringMode).toBe('color')
  })

  it('returns stacked hierarchical mode by default', () => {
    expect(getDefaultParams().hierarchical).toBe('stacked')
  })

  it('does not include maxIterations', () => {
    const params = getDefaultParams()
    expect('maxIterations' in params).toBe(false)
  })
})

describe('presets', () => {
  const requiredKeys: (keyof ConversionParams)[] = [
    'mode',
    'clusteringMode',
    'hierarchical',
    'filterSpeckle',
    'colorPrecision',
    'layerDifference',
    'cornerThreshold',
    'lengthThreshold',
    'spliceThreshold',
    'pathPrecision',
  ]

  it('has at least one preset', () => {
    expect(presets.length).toBeGreaterThan(0)
  })

  it('has unique keys', () => {
    const keys = presets.map(preset => preset.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it.each(presets.map(preset => [preset.key, preset]))('%s contains all required param keys', (_key, preset) => {
    for (const requiredKey of requiredKeys) {
      expect(preset.params).toHaveProperty(requiredKey)
    }
  })

  it.each(presets.map(preset => [preset.key, preset]))('%s does not contain maxIterations', (_key, preset) => {
    expect('maxIterations' in preset.params).toBe(false)
  })

  it('default preset matches getDefaultParams()', () => {
    const defaultPreset = presets.find(preset => preset.key === 'default')
    expect(defaultPreset).toBeDefined()
    expect(getDefaultParams()).toEqual(defaultPreset?.params)
  })
})

describe('findActivePreset', () => {
  it('returns the key when params match a preset exactly', () => {
    for (const preset of presets) {
      expect(findActivePreset({ ...preset.params })).toBe(preset.key)
    }
  })

  it('returns null when params do not match any preset', () => {
    const customParams = { ...getDefaultParams(), filterSpeckle: 999 }
    expect(findActivePreset(customParams)).toBe(null)
  })

  it('returns null when a single value differs', () => {
    const almostDefault = { ...getDefaultParams(), pathPrecision: 3 }
    expect(findActivePreset(almostDefault)).toBe(null)
  })
})

describe('convertToSvg', () => {
  const mockImage = {
    naturalWidth: 100,
    naturalHeight: 200,
  } as HTMLImageElement

  const svgOutput = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200"><path d="M0 0"/></svg>'

  it('returns conversion result with correct dimensions', async () => {
    mockedRunVtracerConversion.mockResolvedValue(svgOutput)

    const result = await convertToSvg(mockImage, getDefaultParams())

    expect(result.width).toBe(100)
    expect(result.height).toBe(200)
    expect(result.svg).toBe(svgOutput)
    expect(result.svgSize).toBeGreaterThan(0)
  })

  it('does not include originalSize in result', async () => {
    mockedRunVtracerConversion.mockResolvedValue(svgOutput)

    const result = await convertToSvg(mockImage, getDefaultParams())

    expect('originalSize' in result).toBe(false)
  })

  it('passes params and progress callback to wasm', async () => {
    mockedRunVtracerConversion.mockResolvedValue(svgOutput)
    const onProgress = vi.fn()
    const params = getDefaultParams()

    await convertToSvg(mockImage, params, onProgress)

    expect(mockedRunVtracerConversion).toHaveBeenCalledWith(mockImage, params, onProgress)
  })

  it('propagates wasm errors', async () => {
    mockedRunVtracerConversion.mockRejectedValue(new Error('WASM panic'))

    await expect(convertToSvg(mockImage, getDefaultParams())).rejects.toThrow('WASM panic')
  })

  it('computes svgSize from actual blob size', async () => {
    const unicodeSvg = '<svg>ñ</svg>'
    mockedRunVtracerConversion.mockResolvedValue(unicodeSvg)

    const result = await convertToSvg(mockImage, getDefaultParams())

    expect(result.svgSize).toBe(new Blob([unicodeSvg]).size)
    expect(result.svgSize).toBeGreaterThan(unicodeSvg.length)
  })
})
