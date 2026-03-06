import { execFile } from 'node:child_process'
import { statSync } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { formatFileSize } from '../../shared/utils/formatFileSize.js'
import { logger } from '../../shared/utils/logger.js'

const execFileAsync = promisify(execFile)

const R2_BUCKET = 'anpr-wiegand26-registry'
const CONCURRENCY = 6

export async function uploadToR2(files: string[], countryCode: string, local: boolean): Promise<void> {
  const target = local ? 'local' : 'remote'
  logger.info('=== Uploading %d file(s) to %s R2 bucket %s (%d concurrent) ===', files.length, target, R2_BUCKET, CONCURRENCY)

  let completed = 0

  async function uploadWithCounter(filepath: string): Promise<void> {
    await uploadFile(filepath, countryCode, local)
    completed++
    logger.info('  [%d/%d] Uploaded %s (%s)', completed, files.length, path.basename(filepath), formatFileSize(statSync(filepath).size))
  }

  const queue = [...files]
  const running = new Set<Promise<void>>()

  while (queue.length > 0 || running.size > 0) {
    while (running.size < CONCURRENCY && queue.length > 0) {
      const filepath = queue.shift()
      if (filepath === undefined) {
        break
      }
      const promise = uploadWithCounter(filepath).then(() => {
        running.delete(promise)
      })
      running.add(promise)
    }
    if (running.size > 0) {
      await Promise.race(running)
    }
  }

  logger.info('=== Upload complete ===')
}

async function uploadFile(filepath: string, countryCode: string, local: boolean): Promise<void> {
  const key = `${countryCode}/${path.basename(filepath)}`
  const args = ['r2', 'object', 'put', `${R2_BUCKET}/${key}`, '--file', filepath, ...(local ? ['--local'] : ['--remote'])]
  const wranglerBin = path.resolve(import.meta.dirname, '../../node_modules/.bin/wrangler')

  try {
    const { stdout, stderr } = await execFileAsync(wranglerBin, args, {
      cwd: path.resolve(import.meta.dirname, '../..'),
    })
    if (stderr) {
      logger.warn('  stderr for %s: %s', key, stderr.trim())
    }
    logger.debug('  %s', stdout.trim())
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error('  Failed to upload %s: %s', key, message)
    throw error
  }
}
