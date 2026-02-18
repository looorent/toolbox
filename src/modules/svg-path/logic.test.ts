import { describe, expect, it } from 'vitest'
import { buildSvgString, gridLines, isValidPathD, viewBoxFromBoundingBox } from './logic'

describe('isValidPathD', () => {
  it('returns false for empty string', () => {
    expect(isValidPathD('')).toBe(false)
  })

  it('returns false for whitespace-only string', () => {
    expect(isValidPathD('   ')).toBe(false)
  })

  it('returns true for path starting with M', () => {
    expect(isValidPathD('M10 10 L90 90')).toBe(true)
  })

  it('returns true for path starting with m (relative)', () => {
    expect(isValidPathD('m10 10 l80 80')).toBe(true)
  })

  it('returns true when path has leading whitespace before M', () => {
    expect(isValidPathD('  M10 10')).toBe(true)
  })

  it('returns false for path starting with L', () => {
    expect(isValidPathD('L10 10')).toBe(false)
  })

  it('returns false for arbitrary text', () => {
    expect(isValidPathD('hello world')).toBe(false)
  })

  it('returns false for numeric-only input', () => {
    expect(isValidPathD('10 20 30')).toBe(false)
  })
})

describe('viewBoxFromBoundingBox', () => {
  it('adds 10% padding by default', () => {
    const result = viewBoxFromBoundingBox({ x: 0, y: 0, width: 100, height: 100 })

    expect(result).toBe('-10 -10 120 120')
  })

  it('handles non-zero origin', () => {
    const result = viewBoxFromBoundingBox({ x: 50, y: 50, width: 100, height: 200 })

    expect(result).toBe('40 30 120 240')
  })

  it('handles negative origin', () => {
    const result = viewBoxFromBoundingBox({ x: -50, y: -50, width: 100, height: 100 })

    expect(result).toBe('-60 -60 120 120')
  })

  it('accepts custom padding', () => {
    const result = viewBoxFromBoundingBox({ x: 0, y: 0, width: 100, height: 100 }, 0.2)

    expect(result).toBe('-20 -20 140 140')
  })

  it('handles zero padding', () => {
    const result = viewBoxFromBoundingBox({ x: 10, y: 20, width: 100, height: 200 }, 0)

    expect(result).toBe('10 20 100 200')
  })
})

describe('gridLines', () => {
  it('returns positions within the range', () => {
    const positions = gridLines(0, 100)

    for (const position of positions) {
      expect(position).toBeGreaterThanOrEqual(0)
      expect(position).toBeLessThanOrEqual(100)
    }
  })

  it('produces roughly 8 lines', () => {
    const positions = gridLines(0, 100)

    expect(positions.length).toBeGreaterThanOrEqual(4)
    expect(positions.length).toBeLessThanOrEqual(12)
  })

  it('picks nice step values', () => {
    const positions = gridLines(0, 100)
    // With size=100, rawStep=12.5, magnitude=1, step should be 20
    // Positions: 0, 20, 40, 60, 80, 100
    expect(positions).toEqual([0, 20, 40, 60, 80, 100])
  })

  it('handles non-zero start', () => {
    const positions = gridLines(50, 100)

    for (const position of positions) {
      expect(position).toBeGreaterThanOrEqual(50)
      expect(position).toBeLessThanOrEqual(150)
    }
  })

  it('handles negative start', () => {
    const positions = gridLines(-50, 100)

    expect(positions[0]).toBeGreaterThanOrEqual(-50)
    expect(positions[positions.length - 1]).toBeLessThanOrEqual(50)
  })

  it('handles small ranges', () => {
    const positions = gridLines(0, 1)

    expect(positions.length).toBeGreaterThanOrEqual(4)
    for (const position of positions) {
      expect(position).toBeGreaterThanOrEqual(0)
      expect(position).toBeLessThanOrEqual(1)
    }
  })

  it('handles large ranges', () => {
    const positions = gridLines(0, 10000)

    expect(positions.length).toBeGreaterThanOrEqual(4)
    expect(positions.length).toBeLessThanOrEqual(12)
  })

  it('returns evenly spaced positions', () => {
    const positions = gridLines(0, 100)
    expect(positions.length).toBeGreaterThanOrEqual(2)

    const first = positions[0] ?? 0
    const second = positions[1] ?? 0
    const step = second - first

    for (let index = 2; index < positions.length; index++) {
      const current = positions[index] ?? 0
      const previous = positions[index - 1] ?? 0
      expect(current - previous).toBeCloseTo(step)
    }
  })
})

describe('buildSvgString', () => {
  it('builds a valid SVG string', () => {
    const result = buildSvgString('M10 10 L90 90', '0 0 100 100', '#ff0000', 'none')

    expect(result).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n' +
        '  <path d="M10 10 L90 90" fill="none" stroke="#ff0000" stroke-width="1" />\n' +
        '</svg>',
    )
  })

  it('includes fill when specified', () => {
    const result = buildSvgString('M0 0', '0 0 10 10', '#000', '#00ff00')

    expect(result).toContain('fill="#00ff00"')
  })

  it('includes the path data verbatim', () => {
    const pathData = 'M10 10 C20 20 40 20 50 10 Z'
    const result = buildSvgString(pathData, '0 0 100 100', '#000', 'none')

    expect(result).toContain(`d="${pathData}"`)
  })
})
