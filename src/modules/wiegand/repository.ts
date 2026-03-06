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

export async function lookupPlatesForAllCountries(wiegandDecimal: number): Promise<CountryPlates[]> {
  try {
    const response = await fetch(`/api/wiegand/plates/${wiegandDecimal}`)
    if (!response.ok) {
      return []
    }
    const body = (await response.json()) as { results: CountryPlates[] }
    return body.results
  } catch {
    return []
  }
}
