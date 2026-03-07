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

export async function lookupPlatesForAllCountries(wiegandDecimal: number, signal?: AbortSignal): Promise<PlatesLookupResult> {
  const url = `/api/wiegand/plates/${wiegandDecimal}`
  try {
    const response = await fetch(url, { signal })
    if (!response.ok) {
      return { results: [], error: `Server error (${response.status})` }
    }
    const body = (await response.json()) as { results: CountryPlates[] }
    return { results: body.results, error: null }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { results: [], error: null }
    }
    console.error(`An error occurred when calling '${url}'.`, error)
    return { results: [], error: 'Failed to look up plates. The server may be overloaded.' }
  }
}
