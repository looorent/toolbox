export type TraceMode = 'polygon' | 'spline' | 'none'
export type ClusteringMode = 'color' | 'binary'
export type HierarchicalMode = 'stacked' | 'cutout'

export interface ConversionParams {
  mode: TraceMode
  clusteringMode: ClusteringMode
  hierarchical: HierarchicalMode
  filterSpeckle: number
  colorPrecision: number
  layerDifference: number
  cornerThreshold: number
  lengthThreshold: number
  spliceThreshold: number
  pathPrecision: number
}

export interface Preset {
  key: string
  label: string
  description: string
  params: ConversionParams
}

export interface ConversionResult {
  svg: string
  svgSize: number
  width: number
  height: number
}
