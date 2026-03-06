import { jsonrepair } from 'jsonrepair'
import type { JsonValidationResult } from './types'

export interface RepairPattern {
  detect: (original: string, repaired: string) => boolean
  locate: (text: string) => number[]
  description: string
  message: string
  hint: string
}

export const REPAIR_PATTERNS: RepairPattern[] = [
  {
    detect: (original, repaired) => /,\s*[}\]]/.test(original) && !/,\s*[}\]]/.test(repaired),
    locate: text =>
      Array.from(text.matchAll(/,(\s*[}\]])/g))
        .filter(match => !isInsideString(text, match.index))
        .map(match => match.index),
    description: 'Removed trailing commas',
    message: 'Trailing comma',
    hint: 'JSON does not allow a comma after the last item in an object or array. Remove the comma before the closing bracket.',
  },
  {
    detect: (original, repaired) => /'/.test(original) && !/'/.test(repaired),
    locate: text => {
      const match = Array.from(text.matchAll(/'/g)).find(singleMatch => !isInsideString(text, singleMatch.index))
      return match ? [match.index] : []
    },
    description: 'Replaced single quotes with double quotes',
    message: 'Single-quoted string',
    hint: 'JSON requires double quotes (") for strings, not single quotes (\').',
  },
  {
    detect: (original, repaired) => UNQUOTED_KEY_PATTERN.test(original) && !UNQUOTED_KEY_PATTERN.test(repaired),
    locate: text => {
      const match = Array.from(text.matchAll(new RegExp(UNQUOTED_KEY_PATTERN, 'g'))).find(
        keyMatch => !isInsideString(text, keyMatch.index + (keyMatch[1]?.length ?? 0)),
      )
      if (match) {
        return [match.index + (match[1]?.length ?? 0)]
      } else {
        return []
      }
    },
    description: 'Quoted unquoted keys',
    message: 'Unquoted key',
    hint: 'All keys in JSON must be wrapped in double quotes.',
  },
  {
    detect: (original, repaired) => /\/\//.test(original) && !/\/\//.test(repaired),
    locate: text =>
      Array.from(text.matchAll(/\/\/.*/g))
        .filter(match => !isInsideString(text, match.index))
        .slice(0, 1)
        .map(match => match.index),
    description: 'Removed comments',
    message: 'Comment not allowed',
    hint: 'JSON does not support comments. Remove the // comment.',
  },
  {
    detect: (original, repaired) => /\/\*/.test(original) && !/\/\*/.test(repaired),
    locate: text =>
      Array.from(text.matchAll(/\/\*[\s\S]*?\*\//g))
        .filter(match => !isInsideString(text, match.index))
        .slice(0, 1)
        .map(match => match.index),
    description: 'Removed block comments',
    message: 'Block comment not allowed',
    hint: 'JSON does not support /* */ comments. Remove the comment.',
  },
  {
    detect: original => /\b(undefined|NaN|Infinity)\b/.test(original),
    locate: text =>
      Array.from(text.matchAll(/\b(undefined|NaN|Infinity)\b/g))
        .filter(match => !isInsideString(text, match.index))
        .map(match => match.index),
    description: 'Replaced JavaScript literals with null',
    message: 'Not valid JSON',
    hint: 'Use null instead. JSON only supports null, true, false, numbers, and strings.',
  },
  {
    detect: (original, repaired) => {
      const missingCommaPattern = /("(?:[^"\\]|\\.)*")(\s*\n\s*)("(?:[^"\\]|\\.)*"\s*:)/
      return missingCommaPattern.test(original) && !missingCommaPattern.test(repaired)
    },
    locate: text => {
      const match = Array.from(text.matchAll(/("(?:[^"\\]|\\.)*")(\s*\n\s*)("(?:[^"\\]|\\.)*"\s*:)/g)).find(commaMatch => {
        const gapStart = commaMatch.index + (commaMatch[1]?.length ?? 0)
        return !isInsideString(text, gapStart)
      })
      if (match) {
        return [match.index + (match[1]?.length ?? 0) + (match[2]?.length ?? 0)]
      } else {
        return []
      }
    },
    description: 'Added missing commas',
    message: 'Missing comma',
    hint: 'It looks like you forgot a comma between two entries. Add a comma at the end of the previous line.',
  },
]

const UNQUOTED_KEY_PATTERN = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/

export function validateJson(input: string): JsonValidationResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { kind: 'empty' }
  }

  try {
    const parsed = JSON.parse(trimmed)
    return {
      kind: 'valid',
      formatted: JSON.stringify(parsed, null, 2),
      minified: JSON.stringify(parsed),
    }
  } catch {
    const autoFix = tryAutoFix(trimmed)
    return {
      kind: 'invalid',
      fixedJson: autoFix?.fixed ?? null,
      fixSummary: autoFix?.applied ?? [],
    }
  }
}

function tryAutoFix(text: string): { fixed: string; applied: string[] } | null {
  try {
    const repaired = jsonrepair(text)
    if (repaired === text) {
      return null
    }

    const parsed = JSON.parse(repaired)
    const fixed = JSON.stringify(parsed, null, 2)
    const applied = describeRepairs(text, repaired)

    return {
      fixed,
      applied: applied.length > 0 ? applied : ['Fixed JSON syntax'],
    }
  } catch {
    return null
  }
}

function describeRepairs(original: string, repaired: string): string[] {
  return REPAIR_PATTERNS.filter(pattern => pattern.detect(original, repaired)).map(pattern => pattern.description)
}

function isInsideString(text: string, offset: number): boolean {
  let inside = false
  for (let characterIndex = 0; characterIndex < offset; characterIndex++) {
    if (text[characterIndex] === '"' && (characterIndex === 0 || text[characterIndex - 1] !== '\\')) {
      inside = !inside
    }
  }
  return inside
}
