import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { logger } from '../../shared/utils/logger.ts'
import { parseCli } from './cli.ts'
import { encodeToDisk } from './encoding.ts'
import { uploadToR2 } from './upload.ts'
import { computeOutputRangeCount, writeJsonFiles } from './write.ts'

const OUTPUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'output')
const TEMP_DIR = path.join(OUTPUT_DIR, 'tmp')

const { country, upload, local, force } = parseCli()

async function main(): Promise<void> {
  logger.info('=== Wiegand26 -> License Plate JSON generator ===')
  logger.info('Output directory:', OUTPUT_DIR)
  logger.info('Country:', country.code)
  logger.info('Upload to R2:', upload, local ? '(local)' : '(remote)', force ? '(force)' : '')
  logger.info('Output ranges:', computeOutputRangeCount())

  mkdirSync(OUTPUT_DIR, { recursive: true })

  await encodeToDisk(country, TEMP_DIR)
  const files = await writeJsonFiles(OUTPUT_DIR, country.code, TEMP_DIR)
  rmSync(TEMP_DIR, { recursive: true })

  if (upload) {
    await uploadToR2(files, country.code, local, force)
  } else {
    logger.info('Skipping R2 upload (use --upload to enable)')
  }

  logger.info('=== Complete ===')
  logger.info('Generated', files.length, 'JSON file(s)')
}

try {
  await main()
} catch (error: unknown) {
  logger.error('Fatal error:', error)
  process.exit(1)
}
