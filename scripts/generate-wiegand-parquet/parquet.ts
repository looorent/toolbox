import { createReadStream, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline'
import { parquetWriteBuffer } from 'hyparquet-writer'
import { MAX_WIEGAND26_DECIMAL, RANGE_SIZE } from '../../shared/modules/wiegand/constants.js'
import { formatFileSize } from '../../shared/utils/formatFileSize.js'
import { logger } from '../../shared/utils/logger.js'

interface Range {
  start: number
  end: number
}

export { RANGE_SIZE }

export function computeRanges(): Range[] {
  const rangeCount = Math.ceil((MAX_WIEGAND26_DECIMAL + 1) / RANGE_SIZE)
  return Array.from({ length: rangeCount }, (_, index) => ({
    start: index * RANGE_SIZE,
    end: Math.min((index + 1) * RANGE_SIZE - 1, MAX_WIEGAND26_DECIMAL),
  }))
}

export async function writeParquetFiles(outputDirectory: string, countryCode: string, tempDir: string): Promise<string[]> {
  const ranges = computeRanges()
  const files: string[] = []
  const padLength = String(MAX_WIEGAND26_DECIMAL).length
  let totalRows = 0

  logger.info('=== Writing %s parquet files (%d ranges) ===', countryCode, ranges.length)

  for (const [rangeIndex, range] of ranges.entries()) {
    const filename = `${String(range.start).padStart(padLength, '0')}-${String(range.end).padStart(padLength, '0')}_${countryCode}_wiegand_to_text.parquet`
    const filepath = path.join(outputDirectory, filename)

    const mapping = await readBucket(tempDir, rangeIndex)

    const wiegandValues: number[] = []
    const platesValues: string[] = []

    for (const [wiegand, plates] of mapping) {
      wiegandValues.push(wiegand)
      platesValues.push(plates)
    }

    const buffer = parquetWriteBuffer({
      columnData: [
        { name: 'wiegand26', data: new Int32Array(wiegandValues), type: 'INT32' },
        { name: 'plates', data: platesValues, type: 'STRING' },
      ],
      codec: 'SNAPPY',
      rowGroupSize: 4096,
    })

    writeFileSync(filepath, new Uint8Array(buffer))
    totalRows += wiegandValues.length
    logger.info('  [%d/%d] %s — %s rows', rangeIndex + 1, ranges.length, filename, wiegandValues.length.toLocaleString())
    files.push(filepath)
  }

  const totalSize = files.reduce((sum, file) => sum + statSync(file).size, 0)
  logger.info('  Total: %s rows, %s', totalRows.toLocaleString(), formatFileSize(totalSize))

  return files
}

async function readBucket(tempDir: string, bucketIndex: number): Promise<Map<number, string>> {
  const filepath = path.join(tempDir, `${bucketIndex}.tsv`)
  const mapping = new Map<number, string>()

  const lineReader = createInterface({
    input: createReadStream(filepath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  })

  for await (const line of lineReader) {
    const tabIndex = line.indexOf('\t')
    if (tabIndex !== -1) {
      const wiegand = parseInt(line.substring(0, tabIndex), 10)
      const plate = line.substring(tabIndex + 1)
      const existing = mapping.get(wiegand)
      if (existing === undefined) {
        mapping.set(wiegand, plate)
      } else {
        mapping.set(wiegand, `${existing},${plate}`)
      }
    }
  }

  return mapping
}
