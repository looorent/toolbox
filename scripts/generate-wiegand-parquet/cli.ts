import { parseArgs } from 'node:util'
import { type Country, countriesByCode } from './countries.js'

const AVAILABLE_CODES = Object.keys(countriesByCode).join(', ')

export interface CliConfig {
  country: Country
  upload: boolean
  local: boolean
}

export function parseCli(): CliConfig {
  const { values } = parseArgs({
    options: {
      country: { type: 'string', short: 'c' },
      upload: { type: 'boolean', short: 'u', default: false },
      local: { type: 'boolean', short: 'l', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    strict: true,
  })

  if (values.help) {
    printUsage(0)
  }

  const countryCode = values.country?.toUpperCase()
  if (!countryCode || !(countryCode in countriesByCode)) {
    console.error('Error: missing or unknown --country. Available:', AVAILABLE_CODES)
    printUsage(1)
  }

  return {
    country: countriesByCode[countryCode],
    upload: values.upload ?? false,
    local: values.local ?? false,
  }
}

function printUsage(exitCode: number): never {
  const output = exitCode === 0 ? console.log : console.error
  output(
    `
Wiegand26 -> License Plate parquet generator

Generates parquet files mapping Wiegand26 decimal values to license plate texts.

Usage:
  pnpm run script:generate-wiegand-parquet -- --country <code> [--upload] [--local]
  pnpm run script:generate-wiegand-parquet -- --help

Options:
  -c, --country <code>  Country code to process (${AVAILABLE_CODES})
  -u, --upload          Upload generated files to Cloudflare R2
  -l, --local           Upload to local Miniflare R2 (via wrangler) instead of remote (via S3 API)
  -h, --help            Show this help message

Environment variables (required for --upload without --local):
  TOOLBOX_CF_ACCOUNT_ID          Your Cloudflare account ID
  TOOLBOX_CF_R2_ACCESS_KEY_ID    R2 API token access key
  TOOLBOX_CF_R2_SECRET_ACCESS_KEY R2 API token secret key

Examples:
  pnpm run script:generate-wiegand-parquet -- --country LU
  pnpm run script:generate-wiegand-parquet -- -c BE --upload
  pnpm run script:generate-wiegand-parquet -- -c LU --upload --local
`.trim(),
  )
  process.exit(exitCode)
}
