import { logger } from '@shared/utils/logger'
import type { AsyncBuffer } from 'hyparquet'
import { parquetReadObjects } from 'hyparquet'
import { computeR2Key } from './logic'

interface ParquetRow {
  wiegand26: number
  plates: string
}

export async function findPlatesByWiegand(env: Env, country: string, wiegand26: number): Promise<string[] | null> {
  const key = computeR2Key(country, wiegand26)
  logger.info('[Wiegand] Fetching R2 object: %s', key)

  const head = await env.R2.head(key)
  if (!head) {
    logger.warn('[Wiegand] R2 object not found: %s', key)
    return null
  }

  logger.info('[Wiegand] R2 head OK: %s (%d bytes)', key, head.size)

  const file = r2AsyncBuffer(env.R2, key, head.size)
  const rows = (await parquetReadObjects({
    file,
    columns: ['wiegand26', 'plates'],
    rowFormat: 'object',
    filter: { wiegand26: { $eq: wiegand26 } },
  })) as ParquetRow[]

  if (rows.length > 0) {
    const plates = rows[0].plates.split(',')
    logger.info('[Wiegand] Found %d plate(s) in %s for wiegand26=%d', plates.length, key, wiegand26)
    return plates
  } else {
    logger.info('[Wiegand] No match in %s for wiegand26=%d', key, wiegand26)
    return null
  }
}

function r2AsyncBuffer(bucket: R2Bucket, key: string, byteLength: number): AsyncBuffer {
  return {
    byteLength,
    async slice(start: number, end?: number): Promise<ArrayBuffer> {
      const object = await bucket.get(key, {
        range: { offset: start, length: (end ?? byteLength) - start },
      })
      if (!object) {
        throw new Error(`R2 range read failed: ${key}`)
      }
      return object.arrayBuffer()
    },
  }
}
