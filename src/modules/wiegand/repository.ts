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

export async function lookupPlatesForAllCountries(
  wiegandDecimal: number,
  countries: WiegandCountry[],
  signal: AbortSignal,
  onResult: (result: CountryPlates) => void,
): Promise<{ error: string | null }> {
  try {
    const results = await Promise.all(
      countries.map(async country => {
        const url = `/api/wiegand/plates/${wiegandDecimal}/${country.code}`
        try {
          const response = await fetch(url, { signal })
          if (!response.ok) {
            return { country: country.code, plates: [] as string[], error: 'lookup_failed' }
          }
          const body = (await response.json()) as { plates: string[] }
          return { country: country.code, plates: body.plates, error: null }
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            throw error
          }
          return { country: country.code, plates: [] as string[], error: 'lookup_failed' }
        }
      }),
    )

    for (const result of results) {
      onResult(result)
    }

    return { error: null }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { error: null }
    }
    return { error: 'Failed to look up plates. The server may be overloaded.' }
  }
}
