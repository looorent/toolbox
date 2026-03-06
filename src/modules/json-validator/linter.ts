import { type Diagnostic, linter } from '@codemirror/lint'
import type { EditorView } from '@codemirror/view'
import { JSONRepairError, jsonrepair } from 'jsonrepair'
import { REPAIR_PATTERNS } from './logic'

function diagnose(view: EditorView): Diagnostic[] {
  const text = view.state.doc.toString()
  const trimmed = text.trim()
  if (!trimmed) {
    return []
  }

  try {
    JSON.parse(trimmed)
    return []
  } catch (parseError: unknown) {
    const trimOffset = text.indexOf(trimmed[0] as string)

    try {
      const repaired = jsonrepair(trimmed)
      if (repaired !== trimmed) {
        const diagnostics = REPAIR_PATTERNS.filter(pattern => pattern.detect(trimmed, repaired)).flatMap(pattern =>
          pattern.locate(trimmed).map(offset => ({
            from: offset + trimOffset,
            to: Math.min(offset + trimOffset + 1, text.length),
            severity: 'error' as const,
            message: `${pattern.message}\n${pattern.hint}`,
          })),
        )

        if (diagnostics.length > 0) {
          return diagnostics
        }
      }
    } catch (repairError: unknown) {
      if (repairError instanceof JSONRepairError && repairError.position != null) {
        const offset = Math.min(repairError.position + trimOffset, text.length)
        const nativeMessage = (parseError as Error).message ?? 'Invalid JSON'
        return [
          {
            from: offset,
            to: Math.min(offset + 1, text.length),
            severity: 'error' as const,
            message: `${friendlyMessage(nativeMessage)}\n${friendlyHint(nativeMessage, trimmed)}`,
          },
        ]
      }
    }

    const nativeMessage = (parseError as Error).message ?? 'Invalid JSON'
    const nativeOffset = parseNativeOffset(parseError, trimmed)
    const offset = Math.min((nativeOffset ?? 0) + trimOffset, text.length)

    return [
      {
        from: offset,
        to: Math.min(offset + 1, text.length),
        severity: 'error' as const,
        message: `${friendlyMessage(nativeMessage)}\n${friendlyHint(nativeMessage, trimmed)}`,
      },
    ]
  }
}

function parseNativeOffset(error: unknown, text: string): number | null {
  const message = (error as Error).message ?? ''

  const chromeMatch = message.match(/at position (\d+)/)
  if (chromeMatch) {
    return Number(chromeMatch[1])
  }

  const firefoxMatch = message.match(/line (\d+) column (\d+)/)
  if (firefoxMatch) {
    return lineColumnToOffset(text, Number(firefoxMatch[1]), Number(firefoxMatch[2]))
  }

  return null
}

function lineColumnToOffset(text: string, line: number, column: number): number {
  let currentLine = 1
  for (let characterIndex = 0; characterIndex < text.length; characterIndex++) {
    if (currentLine === line) {
      return Math.min(characterIndex + column - 1, text.length)
    }
    if (text[characterIndex] === '\n') {
      currentLine++
    }
  }
  return text.length
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

function friendlyHint(native: string, text: string): string {
  if (native.includes('Unexpected end of JSON')) {
    const balance = bracketBalance(text)
    return balance.missing.length > 0
      ? `You seem to be missing: ${balance.missing.join(' ')}. Every opening bracket needs a matching closing bracket.`
      : 'The JSON ends too early. Check that all strings, arrays, and objects are properly closed.'
  } else if (native.includes('Unexpected token')) {
    return 'There is an unexpected character. Check for typos, missing commas, or extra characters.'
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

export const jsonLinterExtension = linter(diagnose)
