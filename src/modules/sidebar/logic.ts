import type { Section, Tool } from './types'

export const sections: Section[] = [
  {
    label: 'Generators',
    tools: [
      { path: '/uuid', name: 'UUID Generator', abbreviation: 'ID' },
      { path: '/qr-code', name: 'QR Code', abbreviation: 'QR' },
    ],
  },
  {
    label: 'Decoders',
    tools: [
      { path: '/jwt', name: 'JWT Decoder', abbreviation: 'JWT' },
      { path: '/pem', name: 'PEM Decoder', abbreviation: 'PEM' },
    ],
  },
  {
    label: 'Encoders',
    tools: [
      { path: '/html-entity', name: 'HTML Entity Encoder', abbreviation: 'HTML' },
      { path: '/url-encode', name: 'URL Encoder', abbreviation: 'URL' },
      { path: '/base64', name: 'Base64 Converter', abbreviation: 'B64' },
      { path: '/base64-image', name: 'Base64 Image Viewer', abbreviation: 'IMG' },
    ],
  },
  {
    label: 'Formatters',
    tools: [{ path: '/json', name: 'JSON Validator', abbreviation: '{ }' }],
  },
  {
    label: 'Converters',
    tools: [
      { path: '/wiegand', name: 'Wiegand Converter', abbreviation: 'WG' },
      { path: '/number', name: 'Number Converter', abbreviation: '#' },
      { path: '/color', name: 'Color Converter', abbreviation: 'CLR' },
      { path: '/epoch', name: 'Epoch Converter', abbreviation: 'TS' },
    ],
  },
  {
    label: 'Utilities',
    tools: [
      { path: '/xor', name: 'XOR Checksum', abbreviation: 'XOR' },
      { path: '/svg-path', name: 'SVG Path Visualizer', abbreviation: 'SVG' },
    ],
  },
  {
    label: 'Reference',
    tools: [{ path: '/cheat-sheets', name: 'Cheat Sheets', abbreviation: 'REF' }],
  },
]

export const allTools: Tool[] = sections.flatMap(section => section.tools)

export function isToolActive(tool: Tool, currentPath: string): boolean {
  return currentPath === tool.path || currentPath.startsWith(`${tool.path}/`)
}

export function findActiveTool(currentPath: string): Tool | null {
  return allTools.find(tool => isToolActive(tool, currentPath)) ?? null
}

export function fuzzyMatch(query: string, target: string): boolean {
  const normalizedQuery = query.toLowerCase()
  const normalizedTarget = target.toLowerCase()
  let queryIndex = 0
  for (const char of normalizedTarget) {
    if (char === normalizedQuery[queryIndex]) {
      queryIndex++
    }
  }
  return queryIndex === normalizedQuery.length
}

export function searchTools(query: string): Tool[] {
  const trimmed = query.trim()
  return trimmed ? allTools.filter(tool => fuzzyMatch(trimmed, tool.name) || fuzzyMatch(trimmed, tool.abbreviation)) : []
}
