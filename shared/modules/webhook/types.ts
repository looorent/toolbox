export interface WebhookMetadata {
  id: string
  ttlInSeconds: number
  createdAt: string
}

export interface CapturedHeader {
  name: string
  value: string
}

export interface CapturedRequest {
  id: string
  method: string
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
