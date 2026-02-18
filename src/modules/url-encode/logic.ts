import type { UrlEncodeMode } from './types'

export function urlEncode(text: string, mode: UrlEncodeMode): string {
  if (!text) {
    return ''
  }

  try {
    switch (mode) {
      case 'component':
        return encodeURIComponent(text)
      case 'full':
        return encodeURI(text)
    }
  } catch (error: unknown) {
    console.error(`[Url Encoder] Error when encoding '${text}' in mode '${mode}'. Returning a blank string.`, error)
    return ''
  }
}

export function urlDecode(text: string, mode: UrlEncodeMode): string | null {
  if (!text) {
    return ''
  }

  try {
    switch (mode) {
      case 'component':
        return decodeURIComponent(text)
      case 'full':
        return decodeURI(text)
    }
  } catch (error: unknown) {
    console.error(`[Url Encoder] Error when decoding '${text}' in mode '${mode}'. Returning null.`, error)
    return null
  }
}
