export interface JsonDiagnostic {
  message: string
  hint: string
  line: number
  column: number
}

export interface JsonEmptyResult {
  kind: 'empty'
}

export interface JsonValidResult {
  kind: 'valid'
  formatted: string
  minified: string
}

export interface JsonInvalidResult {
  kind: 'invalid'
  diagnostics: JsonDiagnostic[]
  fixedJson: string | null
  fixSummary: string[]
}

export type JsonValidationResult = JsonEmptyResult | JsonValidResult | JsonInvalidResult

export type JsonEditorStatus = 'idle' | 'valid' | 'invalid'
