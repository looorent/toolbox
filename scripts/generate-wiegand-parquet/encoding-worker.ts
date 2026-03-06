import { parentPort, workerData } from 'node:worker_threads'
import { encode26 } from 'anpr-wiegand'
import { countriesByCode } from './countries.ts'

export interface EncodingWorkerInput {
  countryCode: string
  sliceIndex: number
}

export interface ChunkMessage {
  type: 'chunk'
  pairs: [number, string][]
  count: number
}

export interface DoneMessage {
  type: 'done'
  count: number
}

export type WorkerMessage = ChunkMessage | DoneMessage

const { countryCode, sliceIndex } = workerData as EncodingWorkerInput

const FLUSH_SIZE = 100_000

const country = countriesByCode[countryCode]
let buffer: [number, string][] = []
let count = 0

for (const plate of country.streamSlice(sliceIndex)) {
  const encoded = encode26(plate)?.wiegand26InDecimal
  if (encoded !== undefined) {
    buffer.push([encoded, plate])
    if (buffer.length >= FLUSH_SIZE) {
      parentPort?.postMessage({ type: 'chunk', pairs: buffer, count } as ChunkMessage)
      buffer = []
    }
  }
  count++
}

if (buffer.length > 0) {
  parentPort?.postMessage({ type: 'chunk', pairs: buffer, count } as ChunkMessage)
}

parentPort?.postMessage({ type: 'done', count } as DoneMessage)
