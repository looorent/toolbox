import type { CapturedRequest, HttpMethod, RequestsPage, WebhookMetadata } from '@shared/modules/webhook/types'

export async function createWebhook(): Promise<WebhookMetadata> {
  const response = await fetch('/api/webhooks', { method: 'POST' })
  if (!response.ok) {
    throw new Error(`Failed to create webhook: ${response.status}`)
  }
  return response.json() as Promise<WebhookMetadata>
}

export async function fetchWebhook(id: string): Promise<WebhookMetadata> {
  const response = await fetch(`/api/webhooks/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch webhook: ${response.status}`)
  }
  return response.json() as Promise<WebhookMetadata>
}

export async function fetchRequests(id: string, cursor?: string): Promise<RequestsPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  const response = await fetch(`/api/webhooks/${id}/requests${query}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch requests: ${response.status}`)
  }
  return response.json() as Promise<RequestsPage>
}

export async function deleteWebhook(id: string): Promise<void> {
  const response = await fetch(`/api/webhooks/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Failed to delete webhook: ${response.status}`)
  }
}

export function getWebhookUrl(id: string): string {
  return `${window.location.origin}/hooks/${id}`
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function formatBodySize(body: string | null): string {
  if (!body) {
    return '0 B'
  }
  const bytes = new TextEncoder().encode(body).length
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}

export function tryFormatJson(body: string): string | null {
  try {
    return JSON.stringify(JSON.parse(body), null, 2)
  } catch {
    return null
  }
}

export function generateRawRequest(request: CapturedRequest): string {
  const queryString = Object.keys(request.queryParams).length > 0 ? `?${new URLSearchParams(request.queryParams).toString()}` : ''
  const requestLine = `${request.method} ${request.path}${queryString} HTTP/1.1`
  const headerLines = request.headers.map(h => `${h.name}: ${h.value}`).join('\n')
  const headerSection = headerLines ? `\n${headerLines}` : ''
  const bodySection = request.body ? `\n\n${request.body}` : ''
  return `${requestLine}${headerSection}${bodySection}`
}

export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'tb-http-method-badge--get',
  POST: 'tb-http-method-badge--post',
  PUT: 'tb-http-method-badge--put',
  PATCH: 'tb-http-method-badge--patch',
  DELETE: 'tb-http-method-badge--delete',
  HEAD: 'tb-http-method-badge--head',
  OPTIONS: 'tb-http-method-badge--options',
}

export function methodColor(method: HttpMethod): string {
  return METHOD_COLORS[method]
}

export function generateCurlCommand(request: CapturedRequest, origin: string): string {
  const queryString = Object.keys(request.queryParams).length > 0 ? `?${new URLSearchParams(request.queryParams).toString()}` : ''
  const url = `${origin}${request.path}${queryString}`
  const parts: string[] = [`curl -X ${request.method} '${url}'`]
  for (const header of request.headers) {
    parts.push(`  -H '${header.name}: ${header.value}'`)
  }
  if (request.body) {
    const escapedBody = request.body.replace(/'/g, "'\\''")
    parts.push(`  --data '${escapedBody}'`)
  }
  return parts.join(' \\\n')
}
