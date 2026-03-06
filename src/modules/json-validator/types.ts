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
  fixedJson: string | null
  fixSummary: string[]
}

export type JsonValidationResult = JsonEmptyResult | JsonValidResult | JsonInvalidResult
