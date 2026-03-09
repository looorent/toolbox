import { createReadStream, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline'
import { MAX_WIEGAND26_DECIMAL, RANGE_SIZE } from '../../shared/modules/wiegand/constants.ts'
import { formatFileSize } from '../../shared/utils/formatFileSize.ts'
import { logger } from '../../shared/utils/logger.ts'
import { ENCODING_PARTITION_COUNT } from './encoding.ts'

export function computeOutputRangeCount(): number {
  return Math.ceil((MAX_WIEGAND26_DECIMAL + 1) / RANGE_SIZE)
}

export async function writeJsonFiles(outputDirectory: string, countryCode: string, tempDir: string): Promise<string[]> {
  const padLength = String(MAX_WIEGAND26_DECIMAL).length
  const files: string[] = []
  let totalEntries = 0

  logger.info('=== Writing %s JSON files (from %d TSV partition) ===', countryCode, ENCODING_PARTITION_COUNT)

  for (let bucketIndex = 0; bucketIndex < ENCODING_PARTITION_COUNT; bucketIndex++) {
    const mapping = await readBucket(tempDir, bucketIndex)
    if (mapping.size > 0) {
      const groups = groupByOutputRange(mapping)
      for (const [rangeStart, entries] of groups) {
        const rangeEnd = Math.min(rangeStart + RANGE_SIZE - 1, MAX_WIEGAND26_DECIMAL)
        const filename = `${String(rangeStart).padStart(padLength, '0')}-${String(rangeEnd).padStart(padLength, '0')}.json`
        const filepath = path.join(outputDirectory, filename)

        const jsonObject: Record<string, string> = {}
        for (const [wiegand, plates] of entries) {
          jsonObject[String(wiegand)] = plates
        }

        writeFileSync(filepath, JSON.stringify(jsonObject))
        files.push(filepath)
        totalEntries += entries.size
      }

      logger.info(
        '  [%d/%d] Processed TSV partition — %d entries, %d JSON files',
        bucketIndex + 1,
        ENCODING_PARTITION_COUNT,
        mapping.size,
        groups.size,
      )
    }
  }

  const totalSize = files.reduce((sum, file) => sum + statSync(file).size, 0)
  logger.info('  Total: %d entries across %d files, %s', totalEntries, files.length, formatFileSize(totalSize))

  return files
}

function groupByOutputRange(mapping: Map<number, string>): Map<number, Map<number, string>> {
  const groups = new Map<number, Map<number, string>>()

  for (const [wiegand, plates] of mapping) {
    const rangeStart = Math.floor(wiegand / RANGE_SIZE) * RANGE_SIZE
    let group = groups.get(rangeStart)
    if (!group) {
      group = new Map()
      groups.set(rangeStart, group)
    }
    group.set(wiegand, plates)
  }

  return groups
}

async function readBucket(tempDir: string, partitionIndex: number): Promise<Map<number, string>> {
  const filepath = path.join(tempDir, `${partitionIndex}.tsv`)
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
