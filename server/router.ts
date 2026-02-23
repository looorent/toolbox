import { logger } from '@shared/utils/logger'
import { captureWebhookRequest, createWebhook, deleteWebhook, getWebhook, listWebhookRequests } from './modules/webhook'

type Params = Record<string, string | undefined>
type Handler = (request: Request, env: Env, params: Params, url: URL) => Promise<Response>

const routes = [
  route('POST', '/api/webhooks', (_req, env) => createWebhook(env)),
  route('GET', '/api/webhooks/:id', (_req, env, params) => getWebhook(env, params.id ?? '')),
  route('GET', '/api/webhooks/:id/requests', (_req, env, params, url) => listWebhookRequests(env, params.id ?? '', url)),
  route('DELETE', '/api/webhooks/:id', (_req, env, params) => deleteWebhook(env, params.id ?? '')),
  route('*', '/hooks/:id{/*}?', (req, env, params, url) => captureWebhookRequest(req, env, params.id ?? '', url)),
]

export async function handleRoute(request: Request, env: Env, url: URL): Promise<Response> {
  for (const { method, pattern, handler } of routes) {
    const match = pattern.exec(url.href)
    if (match && (method === '*' || method === request.method)) {
      const params = match.pathname.groups as Params
      return handler(request, env, params, url)
    }
  }
  logger.warn('Route not found: %s', url.pathname)
  return new Response(null, { status: 404 })
}

function route(method: string, pathname: string, handler: Handler) {
  return { method, pattern: new URLPattern({ pathname }), handler }
}
