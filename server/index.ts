import { logger } from '@shared/utils/logger'
import { handlePreflight } from './cors'
import { createRepository } from './modules/scim/repository'
import { handleRoute } from './router'

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    logger.info('Incoming request: %s %s', request.method, url.pathname)
    return handlePreflight(request) || (await handleRoute(request, env, url, ctx))
  },
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(createRepository(env).deleteStaleServers())
  },
} satisfies ExportedHandler<Env>
