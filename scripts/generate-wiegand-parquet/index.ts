import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { logger } from '../../shared/utils/logger.js'
import { parseCli } from './cli.js'
import { encodeToDisk } from './encoding.js'
import { computeRanges, writeParquetFiles } from './parquet.js'
import { uploadToR2 } from './upload.js'

const OUTPUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'output')
const TEMP_DIR = path.join(OUTPUT_DIR, 'tmp')

const { country, upload, local } = parseCli()

async function main(): Promise<void> {
  logger.info('=== Wiegand26 -> License Plate parquet generator ===')
  logger.info('Output directory:', OUTPUT_DIR)
  logger.info('Country:', country.code)
  logger.info('Upload to R2:', upload, local ? '(local)' : '(remote)')
  logger.info('Ranges:', computeRanges().length)

  mkdirSync(OUTPUT_DIR, { recursive: true })

  await encodeToDisk(country, TEMP_DIR)
  const files = await writeParquetFiles(OUTPUT_DIR, country.code, TEMP_DIR)
  rmSync(TEMP_DIR, { recursive: true })

  if (upload) {
    await uploadToR2(files, country.code, local)
  } else {
    logger.info('Skipping R2 upload (use --upload to enable)')
  }

  logger.info('=== Complete ===')
  logger.info('Generated', files.length, 'parquet file(s)')
}

try {
  await main()
} catch (error: unknown) {
  logger.error('Fatal error:', error)
  process.exit(1)
}
