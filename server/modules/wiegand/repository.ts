import { logger } from '@shared/utils/logger'
import { computeR2Key } from './logic'

export async function findPlatesByWiegand(env: Env, country: string, wiegand26: number): Promise<string[] | null> {
  const key = computeR2Key(country, wiegand26)
  logger.info('[Wiegand] Fetching R2 object: %s', key)

  const object = await env.R2.get(key)
  if (!object) {
    logger.warn('[Wiegand] R2 object not found: %s', key)
    return null
  }

  const map = (await object.json()) as Record<string, string>
  const plates = map[String(wiegand26)]

  if (plates) {
    const result = plates.split(',')
    logger.info('[Wiegand] Found %d plate(s) in %s for wiegand26=%d', result.length, key, wiegand26)
    return result
  } else {
    logger.info('[Wiegand] No match in %s for wiegand26=%d', key, wiegand26)
    return null
  }
}
