import type { ConversionParams } from './types'
import wasmUrl from './vendor/vtracer_webapp_bg.wasm?url'

const MAX_ITERATIONS = 10

export async function runVtracerConversion(
  image: HTMLImageElement,
  params: ConversionParams,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const vtracer = await ensureVtracerIsLoaded()

  const width = image.naturalWidth
  const height = image.naturalHeight
  const canvasId = `vtracer-canvas-${Date.now()}`
  const svgId = `vtracer-svg-${Date.now()}`

  const canvas = createHiddenCanvas(image, canvasId)
  const svgElement = createHiddenSvg(width, height, svgId)

  try {
    const converterParams = buildConverterParams(canvasId, svgId, params)
    const converter = createConverter(vtracer, converterParams, params.clusteringMode)
    await runConverterLoop(converter, onProgress)
    return serializeSvg(svgElement)
  } finally {
    canvas.remove()
    svgElement.remove()
  }
}

let vtracerInitialized = false
async function ensureVtracerIsLoaded(): Promise<typeof import('./vendor/vtracer_webapp')> {
  const vtracer = await import('./vendor/vtracer_webapp')

  if (!vtracerInitialized) {
    await (vtracer.default as (input: string) => Promise<unknown>)(wasmUrl)
    vtracerInitialized = true
  }

  return vtracer
}

// --- DOM helpers ---
// VTracer's WASM reads pixels from a DOM canvas and writes <path> elements into a DOM SVG.
// These helpers create and tear down the temporary hidden elements it needs.

function createHiddenCanvas(image: HTMLImageElement, canvasId: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.id = canvasId
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  canvas.style.display = 'none'
  document.body.appendChild(canvas)

  const context = canvas.getContext('2d')

  if (!context) {
    canvas.remove()
    throw new Error('Failed to get canvas 2D context')
  }

  context.drawImage(image, 0, 0)
  return canvas
}

function createHiddenSvg(width: number, height: number, svgId: string): SVGSVGElement {
  const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svgElement.id = svgId
  svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svgElement.style.display = 'none'
  document.body.appendChild(svgElement)
  return svgElement
}

function serializeSvg(svgElement: SVGSVGElement): string {
  svgElement.style.removeProperty('display')
  return new XMLSerializer().serializeToString(svgElement)
}

function degToRad(degrees: number): number {
  return (degrees / 180) * Math.PI
}

function buildConverterParams(canvasId: string, svgId: string, params: ConversionParams): string {
  return JSON.stringify({
    canvas_id: canvasId,
    svg_id: svgId,
    mode: params.mode,
    clustering_mode: params.clusteringMode,
    hierarchical: params.hierarchical,
    corner_threshold: degToRad(params.cornerThreshold),
    length_threshold: params.lengthThreshold,
    max_iterations: MAX_ITERATIONS,
    splice_threshold: degToRad(params.spliceThreshold),
    filter_speckle: params.filterSpeckle * params.filterSpeckle,
    color_precision: 8 - params.colorPrecision,
    layer_difference: params.layerDifference,
    path_precision: params.pathPrecision,
  })
}

type VtracerConverter = { tick(): boolean; progress(): number; free(): void }

function createConverter(
  vtracer: typeof import('./vendor/vtracer_webapp'),
  converterParams: string,
  clusteringMode: ConversionParams['clusteringMode'],
): VtracerConverter {
  const converter =
    clusteringMode === 'color'
      ? vtracer.ColorImageConverter.new_with_string(converterParams)
      : vtracer.BinaryImageConverter.new_with_string(converterParams)

  converter.init()
  return converter
}

function runConverterLoop(converter: VtracerConverter, onProgress?: (progress: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    function step() {
      try {
        let done = false
        const startTick = performance.now()

        while (!done && performance.now() - startTick < 25) {
          done = converter.tick()
        }

        if (onProgress) {
          onProgress(converter.progress() / 100)
        }

        if (done) {
          converter.free()
          resolve()
        } else {
          setTimeout(step, 1)
        }
      } catch (error) {
        try {
          converter.free()
        } catch {
          // converter may already be in a bad state after a WASM panic
        }
        reject(error)
      }
    }

    step()
  })
}
