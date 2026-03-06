export interface WebhookMetadata {
  id: string
  ttlInSeconds: number
  createdAt: string
}

export interface CapturedHeader {
  name: string
  value: string
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export interface CapturedRequest {
  id: string
  method: HttpMethod
  path: string
  queryParams: Record<string, string>
  headers: CapturedHeader[]
  body: string | null
  contentType: string | null
  timestamp: string
  ip: string | null
}

export interface RequestsPage {
  requests: CapturedRequest[]
  nextCursor: string | null
  hasMore: boolean
}
