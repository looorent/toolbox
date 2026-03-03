import { logger } from '@shared/utils/logger'
import type { ConversionParams, ConversionResult } from './types'
import { runVtracerConversion } from './wasm'

export { findActivePreset, getDefaultParams, presets } from './presets'

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      logger.debug('[ImageToSvg] Loaded image: %dx%d', image.naturalWidth, image.naturalHeight)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    image.src = url
  })
}

export async function convertToSvg(
  image: HTMLImageElement,
  params: ConversionParams,
  onProgress?: (progress: number) => void,
): Promise<ConversionResult> {
  const width = image.naturalWidth
  const height = image.naturalHeight

  logger.debug('[ImageToSvg] Starting SVG conversion: %dx%d, mode=%s, clustering=%s', width, height, params.mode, params.clusteringMode)

  const svgContent = await runVtracerConversion(image, params, onProgress)

  logger.debug('[ImageToSvg] SVG conversion complete: %d bytes', svgContent.length)

  return {
    svg: svgContent,
    svgSize: new Blob([svgContent]).size,
    width,
    height,
  }
}
