import type { JsonDiagnostic } from './types'

type Detector = (text: string) => JsonDiagnostic[]

const DETECT_TRAILING_COMMAS: Detector = text =>
  Array.from(text.matchAll(/,(\s*[}\]])/g))
    .filter(match => !isInsideString(text, match.index))
    .map(match => ({
      message: 'Trailing comma',
      hint: 'JSON does not allow a comma after the last item in an object or array. Remove the comma before the closing bracket.',
      ...offsetToPosition(text, match.index),
    }))

const DETECT_SINGLE_QUOTES: Detector = text => {
  const match = Array.from(text.matchAll(/'/g)).find(singleMatch => !isInsideString(text, singleMatch.index))

  if (match) {
    return [
      {
        message: 'Single-quoted string',
        hint: 'JSON requires double quotes (") for strings, not single quotes (\').',
        ...offsetToPosition(text, match.index),
      },
    ]
  } else {
    return []
  }
}

const DETECT_UNQUOTED_KEYS: Detector = text => {
  const match = Array.from(text.matchAll(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g)).find(
    keyMatch => !isInsideString(text, keyMatch.index + (keyMatch[1]?.length ?? 0)),
  )

  if (match) {
    const keyStart = match.index + (match[1]?.length ?? 0)
    return [
      {
        message: `Unquoted key "${match[2]}"`,
        hint: `All keys in JSON must be wrapped in double quotes: "${match[2]}"`,
        ...offsetToPosition(text, keyStart),
      },
    ]
  } else {
    return []
  }
}

const DETECT_COMMENTS: Detector = text => {
  const singleLine = Array.from(text.matchAll(/\/\/.*/g))
    .filter(match => !isInsideString(text, match.index))
    .slice(0, 1)
    .map(match => ({
      message: 'Comment not allowed',
      hint: 'JSON does not support comments. Remove the // comment.',
      ...offsetToPosition(text, match.index),
    }))

  const multiLine = Array.from(text.matchAll(/\/\*[\s\S]*?\*\//g))
    .filter(match => !isInsideString(text, match.index))
    .slice(0, 1)
    .map(match => ({
      message: 'Block comment not allowed',
      hint: 'JSON does not support /* */ comments. Remove the comment.',
      ...offsetToPosition(text, match.index),
    }))

  return [...singleLine, ...multiLine]
}

const DETECT_JS_LITERALS: Detector = text =>
  Array.from(text.matchAll(/\b(undefined|NaN|Infinity)\b/g))
    .filter(match => !isInsideString(text, match.index))
    .map(match => ({
      message: `"${match[1]}" is not valid JSON`,
      hint: `Use null instead of ${match[1]}. JSON only supports null, true, false, numbers, and strings.`,
      ...offsetToPosition(text, match.index),
    }))

const DETECT_MISSING_COMMAS: Detector = text => {
  const match = Array.from(text.matchAll(/("(?:[^"\\]|\\.)*")(\s*\n\s*)("(?:[^"\\]|\\.)*"\s*:)/g)).find(commaMatch => {
    const gapStart = commaMatch.index + (commaMatch[1]?.length ?? 0)
    return !isInsideString(text, gapStart)
  })

  if (match) {
    const gapStart = match.index + (match[1]?.length ?? 0)
    return [
      {
        message: 'Missing comma',
        hint: 'It looks like you forgot a comma between two entries. Add a comma at the end of the previous line.',
        ...offsetToPosition(text, gapStart + (match[2]?.length ?? 0)),
      },
    ]
  } else {
    return []
  }
}

export const ALL_DETECTORS: Detector[] = [
  DETECT_TRAILING_COMMAS,
  DETECT_SINGLE_QUOTES,
  DETECT_UNQUOTED_KEYS,
  DETECT_COMMENTS,
  DETECT_JS_LITERALS,
  DETECT_MISSING_COMMAS,
]

function isInsideString(text: string, offset: number): boolean {
  let inside = false
  for (let characterIndex = 0; characterIndex < offset; characterIndex++) {
    if (text[characterIndex] === '"' && (characterIndex === 0 || text[characterIndex - 1] !== '\\')) {
      inside = !inside
    }
  }
  return inside
}

export function offsetToPosition(text: string, offset: number): { line: number; column: number } {
  let line = 1
  let column = 1
  for (let characterIndex = 0; characterIndex < offset && characterIndex < text.length; characterIndex++) {
    if (text[characterIndex] === '\n') {
      line++
      column = 1
    } else {
      column++
    }
  }
  return { line, column }
}
