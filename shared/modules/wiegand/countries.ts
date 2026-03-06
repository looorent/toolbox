export interface WiegandCountry {
  code: string
  name: string
  pattern: string
}

export const WIEGAND_COUNTRIES: WiegandCountry[] = [
  { code: 'AT', name: 'Austria', pattern: 'LL-NNNN-L' },
  { code: 'BE', name: 'Belgium', pattern: 'D-LLL-NNN' },
  { code: 'BG', name: 'Bulgaria', pattern: 'L-NNNN-LL' },
  { code: 'CH', name: 'Switzerland', pattern: '[Canton]-NNNNNN' },
  { code: 'CY', name: 'Cyprus', pattern: 'LLL-NNN' },
  { code: 'CZ', name: 'Czech Republic', pattern: 'N-LL-NNNN' },
  { code: 'DE', name: 'Germany', pattern: 'LL-L-N…NNNN' },
  { code: 'DK', name: 'Denmark', pattern: 'LL-NNNNN' },
  { code: 'EE', name: 'Estonia', pattern: 'NNN-LLL' },
  { code: 'ES', name: 'Spain', pattern: 'NNNN-LLL' },
  { code: 'FI', name: 'Finland', pattern: 'LLL-NNN' },
  { code: 'FR', name: 'France', pattern: 'LL-NNN-LL' },
  { code: 'GB', name: 'United Kingdom', pattern: 'LL-NN-LL' },
  { code: 'GR', name: 'Greece', pattern: 'LLL-NNNN' },
  { code: 'HR', name: 'Croatia', pattern: 'LL-NNNN-L' },
  { code: 'HU', name: 'Hungary', pattern: 'LLL-NNN' },
  { code: 'IE', name: 'Ireland', pattern: 'NNN-L-NNNN' },
  { code: 'IS', name: 'Iceland', pattern: 'LL-NNN' },
  { code: 'IT', name: 'Italy', pattern: 'LL-NNN-LL' },
  { code: 'LI', name: 'Liechtenstein', pattern: 'FL-NNNNN' },
  { code: 'LT', name: 'Lithuania', pattern: 'LLL-NNN' },
  { code: 'LU', name: 'Luxembourg', pattern: 'NNNNNN' },
  { code: 'LV', name: 'Latvia', pattern: 'LL-NNNN' },
  { code: 'MT', name: 'Malta', pattern: 'LLL-NNN' },
  { code: 'NL', name: 'Netherlands', pattern: 'Sidecodes 6–9' },
  { code: 'NO', name: 'Norway', pattern: 'LL-NNNNN' },
  { code: 'PL', name: 'Poland', pattern: 'LL-NNNNN' },
  { code: 'PT', name: 'Portugal', pattern: 'LL-NN-LL' },
  { code: 'RO', name: 'Romania', pattern: 'LL-NNN-LL' },
  { code: 'SE', name: 'Sweden', pattern: 'LLL-NN-L' },
  { code: 'SI', name: 'Slovenia', pattern: 'LL-NNNNN' },
  { code: 'SK', name: 'Slovakia', pattern: 'LL-NNN-LL' },
]

export const WIEGAND_COUNTRY_CODES = new Set(WIEGAND_COUNTRIES.map(country => country.code))

export interface CountryPlates {
  country: string
  plates: string[]
  error: string | null
}
