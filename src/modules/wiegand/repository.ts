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

export async function lookupPlatesForAllCountries(wiegandDecimal: number, signal?: AbortSignal): Promise<CountryPlates[]> {
  const url = `/api/wiegand/plates/${wiegandDecimal}`
  try {
    const response = await fetch(url, { signal })
    if (!response.ok) {
      return []
    }
    const body = (await response.json()) as { results: CountryPlates[] }
    return body.results
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return []
    }
    console.error(`An error occurred when calling '${url}'. Returning [].`, error)
    return []
  }
}
