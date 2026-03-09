import { exec, execFile } from 'node:child_process'
import { createReadStream, statSync } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { formatFileSize } from '../../shared/utils/formatFileSize.ts'
import { logger } from '../../shared/utils/logger.ts'

const execAsync = promisify(exec)
const execFileAsync = promisify(execFile)

const R2_BUCKET = 'anpr-wiegand26-json-registry'
const CONCURRENCY = 6

function createS3Client(): S3Client {
  const accountId = process.env.TOOLBOX_CF_ACCOUNT_ID
  const accessKeyId = process.env.TOOLBOX_CF_R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.TOOLBOX_CF_R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing R2 credentials. Set TOOLBOX_CF_ACCOUNT_ID, TOOLBOX_CF_R2_ACCESS_KEY_ID, and TOOLBOX_CF_R2_SECRET_ACCESS_KEY environment variables.\n' +
        'Create an R2 API token at: https://dash.cloudflare.com → R2 → Manage R2 API Tokens',
    )
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
}

export async function uploadToR2(files: string[], countryCode: string, local: boolean, force: boolean): Promise<void> {
  const target = local ? 'local (wrangler)' : 'remote (S3 API)'
  if (local) {
    logger.info('=== Uploading %d file(s) to %s R2 bucket %s (sequential) ===', files.length, target, R2_BUCKET)
  } else {
    logger.info('=== Uploading %d file(s) to %s R2 bucket %s (%d concurrent) ===', files.length, target, R2_BUCKET, CONCURRENCY)
  }

  let completed = 0
  let skipped = 0

  async function uploadWithCounter(filepath: string): Promise<void> {
    const key = `${countryCode}/${path.basename(filepath)}`

    if (!force && !local) {
      const exists = await objectExistsRemote(key)
      if (exists) {
        skipped++
        logger.info('  [skip] %s already exists on R2', key)
        return
      }
    }

    if (!force && local) {
      const exists = await objectExistsLocal(key)
      if (exists) {
        skipped++
        logger.info('  [skip] %s already exists on local R2', key)
        return
      }
    }

    if (local) {
      await uploadFileLocal(filepath, countryCode)
    } else {
      await uploadFileRemote(filepath, countryCode)
    }
    completed++
    logger.info(
      '  [%d/%d] Uploaded %s (%s)',
      completed,
      files.length - skipped,
      path.basename(filepath),
      formatFileSize(statSync(filepath).size),
    )
  }

  if (local) {
    for (const filepath of files) {
      await uploadWithCounter(filepath)
    }
  } else {
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
  }

  if (skipped > 0) {
    logger.info('=== Upload complete (%d uploaded, %d skipped) ===', completed, skipped)
  } else {
    logger.info('=== Upload complete ===')
  }
}

let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = createS3Client()
  }
  return s3Client
}

async function objectExistsRemote(key: string): Promise<boolean> {
  const client = getS3Client()
  try {
    await client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

async function objectExistsLocal(key: string): Promise<boolean> {
  const wranglerBin = path.resolve(import.meta.dirname, '../../node_modules/.bin/wrangler')
  try {
    await execAsync(`"${wranglerBin}" r2 object get "${R2_BUCKET}/${key}" --local --pipe > /dev/null`, {
      cwd: path.resolve(import.meta.dirname, '../..'),
    })
    return true
  } catch {
    return false
  }
}

async function uploadFileRemote(filepath: string, countryCode: string): Promise<void> {
  const client = getS3Client()
  const key = `${countryCode}/${path.basename(filepath)}`

  try {
    const upload = new Upload({
      client,
      params: {
        Bucket: R2_BUCKET,
        Key: key,
        Body: createReadStream(filepath),
        ContentType: 'application/octet-stream',
      },
      queueSize: 4,
      partSize: 10 * 1024 * 1024,
    })

    await upload.done()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error('  Failed to upload %s: %s', key, message)
    throw error
  }
}

async function uploadFileLocal(filepath: string, countryCode: string): Promise<void> {
  const key = `${countryCode}/${path.basename(filepath)}`
  const args = ['r2', 'object', 'put', `${R2_BUCKET}/${key}`, '--file', filepath, '--local']
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
