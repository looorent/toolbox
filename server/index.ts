import { logger } from '@shared/utils/logger'
import { handlePreflight } from './cors'
import { handleRoute } from './router'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    logger.info('Incoming request: %s %s', request.method, url.pathname)
    return handlePreflight(request) || (await handleRoute(request, env, url))
  },
} satisfies ExportedHandler<Env>
