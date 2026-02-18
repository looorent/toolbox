import type { PathBoundingBox } from './types'

/**
 * Compute the bounding box of an SVG path `d` attribute
 * by rendering it off-screen and using the browser's native getBBox().
 */
export function computeBoundingBox(pathData: string): PathBoundingBox | null {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('style', 'position:fixed;opacity:0;pointer-events:none')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', pathData)
  svg.appendChild(path)
  document.body.appendChild(svg)
  try {
    const box = path.getBBox()
    if (box.width === 0 && box.height === 0 && box.x === 0 && box.y === 0) {
      return null
    }
    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    }
  } catch (error: unknown) {
    console.warn(`[SVG Preview] Error when computing bounding box '${pathData}'. Returning null.`, error)
    return null
  } finally {
    document.body.removeChild(svg)
  }
}

/**
 * Build a viewBox string with padding around the bounding box.
 */
export function viewBoxFromBoundingBox(boundingBox: PathBoundingBox, padding = 0.1): string {
  const padX = boundingBox.width * padding
  const padY = boundingBox.height * padding
  const viewBoxX = boundingBox.x - padX
  const viewBoxY = boundingBox.y - padY
  const viewBoxWidth = boundingBox.width + padX * 2
  const viewBoxHeight = boundingBox.height + padY * 2
  return `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`
}

/**
 * Basic validation: does the string look like a plausible SVG path d attribute?
 */
export function isValidPathD(pathData: string): boolean {
  const trimmed = pathData.trim()
  if (!trimmed) {
    return false
  }
  // Must start with a move command (M or m)
  return /^[Mm]/.test(trimmed)
}

/**
 * Compute grid line positions for a given axis range.
 * Picks a "nice" step (1, 2, 5, 10, 20, 50, ...) so roughly 8 lines appear.
 */
export function gridLines(start: number, size: number): number[] {
  const rawStep = size / 8
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const candidates = [1, 2, 5, 10]
  const step = candidates.map(candidate => candidate * magnitude).find(stepCandidate => stepCandidate >= rawStep) ?? rawStep
  const positions: number[] = []
  const first = Math.ceil(start / step) * step
  for (let position = first; position <= start + size; position += step) {
    positions.push(position)
  }
  return positions
}

/**
 * Build a full standalone <svg> string for copying.
 */
export function buildSvgString(pathData: string, viewBox: string, stroke: string, fill: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">\n  <path d="${pathData}" fill="${fill}" stroke="${stroke}" stroke-width="1" />\n</svg>`
}
