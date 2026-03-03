import type { ConversionParams, Preset } from './types'

const defaultParams: ConversionParams = {
  mode: 'spline',
  clusteringMode: 'color',
  hierarchical: 'stacked',
  filterSpeckle: 4,
  colorPrecision: 6,
  layerDifference: 16,
  cornerThreshold: 60,
  lengthThreshold: 4.0,
  spliceThreshold: 45,
  pathPrecision: 8,
}

export const presets: Preset[] = [
  {
    key: 'default',
    label: 'Default',
    description: 'Balanced quality and file size',
    params: defaultParams,
  },
  {
    key: 'smallest',
    label: 'Smallest file',
    description: 'Aggressive simplification for minimal file size',
    params: {
      mode: 'spline',
      clusteringMode: 'color',
      hierarchical: 'stacked',
      filterSpeckle: 16,
      colorPrecision: 3,
      layerDifference: 64,
      cornerThreshold: 90,
      lengthThreshold: 10.0,
      spliceThreshold: 90,
      pathPrecision: 4,
    },
  },
  {
    key: 'high-fidelity',
    label: 'High fidelity',
    description: 'Maximum detail preservation',
    params: {
      mode: 'spline',
      clusteringMode: 'color',
      hierarchical: 'stacked',
      filterSpeckle: 1,
      colorPrecision: 8,
      layerDifference: 4,
      cornerThreshold: 30,
      lengthThreshold: 1.0,
      spliceThreshold: 20,
      pathPrecision: 8,
    },
  },
  {
    key: 'pixel-art',
    label: 'Pixel art',
    description: 'Sharp edges for pixel-art style images',
    params: {
      mode: 'polygon',
      clusteringMode: 'binary',
      hierarchical: 'stacked',
      filterSpeckle: 0,
      colorPrecision: 8,
      layerDifference: 16,
      cornerThreshold: 180,
      lengthThreshold: 0,
      spliceThreshold: 0,
      pathPrecision: 8,
    },
  },
  {
    key: 'posterized',
    label: 'Posterized',
    description: 'Flat color blocks with few layers',
    params: {
      mode: 'spline',
      clusteringMode: 'color',
      hierarchical: 'cutout',
      filterSpeckle: 8,
      colorPrecision: 2,
      layerDifference: 48,
      cornerThreshold: 60,
      lengthThreshold: 4.0,
      spliceThreshold: 45,
      pathPrecision: 6,
    },
  },
]

export function getDefaultParams(): ConversionParams {
  return { ...defaultParams }
}

export function findActivePreset(params: ConversionParams): string | null {
  const match = presets.find(preset =>
    (Object.keys(preset.params) as (keyof ConversionParams)[]).every(key => preset.params[key] === params[key]),
  )
  return match ? match.key : null
}
