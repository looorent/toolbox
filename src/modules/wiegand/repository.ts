import type { WiegandCountry } from '@shared/modules/wiegand/countries'
import type { CountryPlates } from './types'

export async function fetchSupportedCountries(): Promise<WiegandCountry[]> {
  try {
    const response = await fetch('/api/wiegand/countries')
    if (!response.ok) {
      return []
    }
    const body = (await response.json()) as { countries: WiegandCountry[] }
    return body.countries
  } catch {
    return []
  }
}

export interface PlatesLookupResult {
  results: CountryPlates[]
  error: string | null
}

export async function lookupPlatesForAllCountries(
  wiegandDecimal: number,
  signal: AbortSignal,
  onResult: (result: CountryPlates) => void,
): Promise<{ error: string | null }> {
  const url = `/api/wiegand/plates/${wiegandDecimal}`
  try {
    const response = await fetch(url, { signal })
    if (!response.ok) {
      return { error: `Server error (${response.status})` }
    }

    const reader = response.body?.getReader()
    if (!reader) {
      return { error: 'No response body' }
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (line.trim()) {
          const result = JSON.parse(line) as CountryPlates
          onResult(result)
        }
      }
    }

    if (buffer.trim()) {
      const result = JSON.parse(buffer) as CountryPlates
      onResult(result)
    }

    return { error: null }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { error: null }
    }
    console.error(`An error occurred when calling '${url}'.`, error)
    return { error: 'Failed to look up plates. The server may be overloaded.' }
  }
}
