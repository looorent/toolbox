import { createWriteStream, mkdirSync, type WriteStream } from 'node:fs'
import { availableParallelism } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker } from 'node:worker_threads'
import { MAX_WIEGAND26_DECIMAL } from '../../shared/modules/wiegand/constants.ts'
import { logger } from '../../shared/utils/logger.ts'
import type { Country } from './countries.ts'
import type { EncodingWorkerInput, WorkerMessage } from './encoding-worker.ts'

const workerPath = fileURLToPath(new URL('./encoding-worker.ts', import.meta.url))

const LOG_INTERVAL = 1_000_000

const ENCODING_PARTITION_SIZE = 524_288 // 2^19 -> 32 TSV files during generation
export const ENCODING_PARTITION_COUNT = Math.ceil((MAX_WIEGAND26_DECIMAL + 1) / ENCODING_PARTITION_SIZE)

export async function encodeToDisk(country: Country, temporaryDirectory: string): Promise<void> {
  const workerCount = Math.min(availableParallelism(), 8, country.sliceCount)
  logger.info('=== Encoding %s plates (%d workers, %d slices) ===', country.code, workerCount, country.sliceCount)

  mkdirSync(temporaryDirectory, { recursive: true })
  const streams = Array.from({ length: ENCODING_PARTITION_COUNT }, (_, index) =>
    createWriteStream(path.join(temporaryDirectory, `${index}.tsv`)),
  )

  const progress = createProgressTracker(country)

  for (let batchStart = 0; batchStart < country.sliceCount; batchStart += workerCount) {
    const batchEnd = Math.min(batchStart + workerCount, country.sliceCount)
    const sliceIndices = Array.from({ length: batchEnd - batchStart }, (_, index) => batchStart + index)

    const workers = spawnWorkers(country.code, sliceIndices)
    await collectResults(workers, sliceIndices, streams, progress)
    await terminateWorkers(workers)
  }

  await closeStreams(streams)
  logger.info('  Encoding complete')
}

function createProgressTracker(country: Country): { update: (sliceIndex: number, count: number) => void } {
  const workerCounts: number[] = Array(country.sliceCount).fill(0)
  let lastLoggedTotal = 0

  return {
    update(sliceIndex: number, count: number): void {
      workerCounts[sliceIndex] = count
      const processed = workerCounts.reduce((sum, value) => sum + value, 0)
      const logThreshold = Math.floor(processed / LOG_INTERVAL)
      if (logThreshold > lastLoggedTotal) {
        lastLoggedTotal = logThreshold
        const percent = ((processed / country.totalPlates) * 100).toFixed(1)
        logger.info('  %s / %s plates (%s%%)', processed.toLocaleString(), country.totalPlates.toLocaleString(), percent)
      }
    },
  }
}

function spawnWorkers(countryCode: string, sliceIndices: number[]): Worker[] {
  return sliceIndices.map(
    sliceIndex =>
      new Worker(workerPath, {
        workerData: { countryCode, sliceIndex } as EncodingWorkerInput,
        execArgv: ['--experimental-transform-types', '--no-warnings'],
      }),
  )
}

function collectResults(
  workers: Worker[],
  sliceIndices: number[],
  streams: WriteStream[],
  progress: { update: (sliceIndex: number, count: number) => void },
): Promise<unknown> {
  return Promise.all(
    workers.map(
      (worker, index) =>
        new Promise<void>((resolve, reject) => {
          worker.on('message', (message: WorkerMessage) => {
            if (message.type === 'chunk') {
              writeToDisk(streams, message.pairs)
              progress.update(sliceIndices[index], message.count)
            } else if (message.type === 'done') {
              progress.update(sliceIndices[index], message.count)
              resolve()
            }
          })
          worker.on('error', reject)
        }),
    ),
  )
}

function writeToDisk(streams: WriteStream[], pairs: [number, string][]): void {
  const buckets: string[][] = Array.from({ length: streams.length }, () => [])
  for (const [wiegand, plate] of pairs) {
    const bucketIndex = Math.floor(wiegand / ENCODING_PARTITION_SIZE)
    buckets[bucketIndex].push(`${wiegand}\t${plate}\n`)
  }
  for (let index = 0; index < streams.length; index++) {
    if (buckets[index].length > 0) {
      streams[index].write(buckets[index].join(''))
    }
  }
}

async function terminateWorkers(workers: Worker[]): Promise<void> {
  for (const worker of workers) {
    await worker.terminate()
  }
}

function closeStreams(streams: WriteStream[]): Promise<void> {
  return new Promise(resolve => {
    let remaining = streams.length
    for (const stream of streams) {
      stream.end(() => {
        remaining--
        if (remaining === 0) {
          resolve()
        }
      })
    }
  })
}
