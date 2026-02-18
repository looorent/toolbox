import { JSONRepairError, jsonrepair } from 'jsonrepair'
import { ALL_DETECTORS, offsetToPosition } from './detector'
import type { JsonEditorStatus, JsonValidationResult } from './types'

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
  } catch (error: unknown) {
    const diagnostics = ALL_DETECTORS.flatMap(detect => detect(trimmed))

    if (diagnostics.length === 0) {
      let repairPosition: { line: number; column: number } | null = null
      try {
        jsonrepair(trimmed)
      } catch (repairError) {
        if (repairError instanceof JSONRepairError && repairError.position != null) {
          repairPosition = offsetToPosition(trimmed, repairError.position)
        }
      }

      const position = repairPosition ?? parseNativeError(error, trimmed)
      const nativeMessage = (error as Error).message ?? 'Invalid JSON'
      diagnostics.push({
        message: friendlyMessage(nativeMessage),
        hint: friendlyHint(nativeMessage, trimmed, position),
        line: position?.line ?? 1,
        column: position?.column ?? 1,
      })
    }

    const autoFix = tryAutoFix(trimmed)
    return {
      kind: 'invalid',
      diagnostics,
      fixedJson: autoFix?.fixed ?? null,
      fixSummary: autoFix?.applied ?? [],
    }
  }
}

function parseNativeError(error: unknown, text: string): { line: number; column: number } | null {
  const message = (error as Error).message ?? ''

  const chromeMatch = message.match(/at position (\d+)/)
  if (chromeMatch) {
    return offsetToPosition(text, Number(chromeMatch[1]))
  }

  const firefoxMatch = message.match(/line (\d+) column (\d+)/)
  return firefoxMatch ? { line: Number(firefoxMatch[1]), column: Number(firefoxMatch[2]) } : null
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

const UNQUOTED_KEY_PATTERN = /([{,]\s*)([a-zA-Z_$]\w*)(\s*:)/
function describeRepairs(original: string, repaired: string): string[] {
  const repairChecks: Array<[boolean, string]> = [
    [/\/\//.test(original) && !/\/\//.test(repaired), 'Removed comments'],
    [/\/\*/.test(original) && !/\/\*/.test(repaired), 'Removed block comments'],
    [/'/.test(original) && !/'/.test(repaired), 'Replaced single quotes with double quotes'],
    [/,\s*[}\]]/.test(original) && !/,\s*[}\]]/.test(repaired), 'Removed trailing commas'],
    [/\b(undefined|NaN|Infinity)\b/.test(original), 'Replaced JavaScript literals with null'],
    [UNQUOTED_KEY_PATTERN.test(original) && !UNQUOTED_KEY_PATTERN.test(repaired), 'Quoted unquoted keys'],
  ]
  return repairChecks.filter(([matched]) => matched).map(([, description]) => description)
}

function friendlyMessage(native: string): string {
  switch (true) {
    case native.includes('Unexpected token'): {
      const token = native.match(/Unexpected token (.)/)?.[1]
      return token ? `Unexpected character "${token}"` : 'Unexpected character'
    }
    case native.includes('Unexpected end of JSON'):
      return 'Unexpected end of input'
    case native.includes('Unterminated string'):
      return 'Unterminated string'
    case native.includes("Expected ',' or '}'"):
      return 'Missing comma or closing brace'
    case native.includes("Expected ',' or ']'"):
      return 'Missing comma or closing bracket'
    default:
      return 'Syntax error'
  }
}

function friendlyHint(native: string, text: string, position: { line: number; column: number } | null): string {
  if (native.includes('Unexpected end of JSON')) {
    const balance = bracketBalance(text)
    return balance.missing.length > 0
      ? `You seem to be missing: ${balance.missing.join(' ')}. Every opening bracket needs a matching closing bracket.`
      : 'The JSON ends too early. Check that all strings, arrays, and objects are properly closed.'
  } else if (native.includes('Unexpected token')) {
    if (position) {
      const errorLine = text.split('\n')[position.line - 1] ?? ''
      const around = errorLine.trim()
      return around
        ? `Check line ${position.line} near: "${truncate(around, 60)}". There may be a typo, a missing comma, or an extra character.`
        : 'There is an unexpected character. Check for typos, missing commas, or extra characters.'
    } else {
      return 'There is an unexpected character. Check for typos, missing commas, or extra characters.'
    }
  } else {
    return 'Check the JSON syntax around the indicated position.'
  }
}

function bracketBalance(text: string): { missing: string[] } {
  const stack: string[] = []
  const pairs: Record<string, string> = { '{': '}', '[': ']' }
  let inString = false

  for (let characterIndex = 0; characterIndex < text.length; characterIndex++) {
    const character = text[characterIndex]
    if (character === '"' && (characterIndex === 0 || text[characterIndex - 1] !== '\\')) {
      inString = !inString
    } else if (!inString) {
      if (character === '{' || character === '[') {
        stack.push(character)
      } else if (character === '}' || character === ']') {
        const top = stack[stack.length - 1]
        if (stack.length > 0 && top && pairs[top] === character) {
          stack.pop()
        }
      }
    }
  }

  return { missing: stack.map(bracket => pairs[bracket]).filter((value): value is string => value != null) }
}

function truncate(source: string, max: number): string {
  return source.length > max ? `${source.slice(0, max)}...` : source
}

export function resultToEditorStatus(result: JsonValidationResult): JsonEditorStatus {
  switch (result?.kind) {
    case 'empty':
      return 'idle'
    case 'valid':
      return 'valid'
    case 'invalid':
      return 'invalid'
  }
}
