import { WIEGAND_COUNTRIES, WIEGAND_COUNTRY_CODES } from '@shared/modules/wiegand/countries'
import { logger } from '@shared/utils/logger'
import { isValidWiegand26 } from './logic'
import { findPlatesByWiegand } from './repository'

export async function listWiegandCountries(env: Env): Promise<Response> {
  try {
    const listed = await env.R2.list({ delimiter: '/' })
    const availableCodes = new Set(listed.delimitedPrefixes.map(prefix => prefix.replace('/', '')))
    const countries = WIEGAND_COUNTRIES.filter(country => availableCodes.has(country.code))
    return new Response(JSON.stringify({ countries }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error('[Wiegand] Failed to list countries: %s', message)
    return Response.json({ error: 'list_failed' }, { status: 500 })
  }
}

export async function batchLookupWiegandPlates(request: Request, env: Env, wiegandValue: string): Promise<Response> {
  const wiegand26 = Number(wiegandValue)
  if (!isValidWiegand26(wiegand26)) {
    return Response.json({ error: 'invalid_wiegand26_value', value: wiegandValue }, { status: 400 })
  }

  const signal = request.signal

  try {
    const listed = await env.R2.list({ delimiter: '/' })
    const availableCodes = listed.delimitedPrefixes.map(prefix => prefix.replace('/', '')).filter(code => WIEGAND_COUNTRY_CODES.has(code))

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        for (const country of availableCodes) {
          if (signal.aborted) {
            controller.close()
            return
          }
          try {
            const plates = await findPlatesByWiegand(env, country, wiegand26)
            const line = JSON.stringify({ country, plates: plates ?? [], error: null })
            controller.enqueue(encoder.encode(`${line}\n`))
          } catch {
            const line = JSON.stringify({ country, plates: [], error: 'lookup_failed' })
            controller.enqueue(encoder.encode(`${line}\n`))
          }
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'application/x-ndjson' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error('[Wiegand] Batch lookup failed for %d: %s', wiegand26, message)
    return Response.json({ error: 'lookup_failed' }, { status: 500 })
  }
}

export async function lookupWiegandPlates(env: Env, country: string, wiegandValue: string): Promise<Response> {
  const upperCountry = country.toUpperCase()
  if (!WIEGAND_COUNTRY_CODES.has(upperCountry)) {
    return Response.json({ error: 'unsupported_country', country: upperCountry }, { status: 400 })
  }

  const wiegand26 = Number(wiegandValue)
  if (!isValidWiegand26(wiegand26)) {
    return Response.json({ error: 'invalid_wiegand26_value', value: wiegandValue }, { status: 400 })
  }

  try {
    const plates = await findPlatesByWiegand(env, upperCountry, wiegand26)
    if (plates) {
      logger.info('[Wiegand] Found %d plate(s) for %s/%d', plates.length, upperCountry, wiegand26)
      return Response.json({ plates })
    } else {
      logger.info('[Wiegand] No plates found for %s/%d', upperCountry, wiegand26)
      return Response.json({ plates: [] })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error('[Wiegand] Lookup failed for %s/%d: %s', upperCountry, wiegand26, message)
    return Response.json({ error: 'lookup_failed' }, { status: 500 })
  }
}
