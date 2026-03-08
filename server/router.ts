import { logger } from '@shared/utils/logger'
import {
  apiAddGroupMember,
  apiCreateGroup,
  apiCreateServer,
  apiCreateUser,
  apiDeleteGroup,
  apiDeleteServer,
  apiDeleteUser,
  apiGetScimOpenApiSpec,
  apiGetServer,
  apiListGroups,
  apiListUsers,
  apiRemoveGroupMember,
  apiUpdateGroup,
  apiUpdateUser,
  scimCountResources,
  scimCreateGroup,
  scimCreateUser,
  scimDeleteGroup,
  scimDeleteUser,
  scimGetGroup,
  scimGetUser,
  scimListGroups,
  scimListUsers,
  scimPatchGroup,
  scimPatchUser,
  scimReplaceGroup,
  scimReplaceUser,
  scimResourceTypes,
  scimSchemasEndpoint,
  scimServiceProviderConfig,
} from './modules/scim'
import { captureWebhookRequest, createWebhook, deleteWebhook, getWebhook, getWebhookOpenApiSpec, listWebhookRequests } from './modules/webhook'
import { listWiegandCountries, lookupWiegandPlates } from './modules/wiegand'

type Params = Record<string, string | undefined>
type Handler = (request: Request, env: Env, params: Params, url: URL, ctx: ExecutionContext) => Promise<Response>

const routes = [
  // Webhook routes
  route('POST', '/api/webhooks', (_req, env) => createWebhook(env)),
  route('GET', '/api/webhooks/:id', (_req, env, params) => getWebhook(env, params.id ?? '')),
  route('GET', '/api/webhooks/:id/requests', (_req, env, params, url) => listWebhookRequests(env, params.id ?? '', url)),
  route('GET', '/api/webhooks/:id/openapi.json', (_req, env, params, url) => getWebhookOpenApiSpec(env, params.id ?? '', url)),
  route('DELETE', '/api/webhooks/:id', (_req, env, params) => deleteWebhook(env, params.id ?? '')),
  route('*', '/hooks/:id{/*}?', (req, env, params, url) => captureWebhookRequest(req, env, params.id ?? '', url)),

  // Wiegand
  route('GET', '/api/wiegand/countries', (_req, env) => listWiegandCountries(env)),
  route('GET', '/api/wiegand/plates/:wiegandValue/:country', (_req, env, params) => lookupWiegandPlates(env, params.country ?? '', params.wiegandValue ?? '')),

  // SCIM server management (UI API)
  route('POST', '/api/scim-servers', (req, env) => apiCreateServer(req, env)),
  route('GET', '/api/scim-servers/:id', (_req, env, params) => apiGetServer(env, params.id ?? '')),
  route('GET', '/api/scim-servers/:id/openapi.json', (req, env, params) => apiGetScimOpenApiSpec(req, env, params.id ?? '')),
  route('DELETE', '/api/scim-servers/:id', (_req, env, params) => apiDeleteServer(env, params.id ?? '')),

  // SCIM user management (UI API)
  route('GET', '/api/scim-servers/:id/users', (_req, env, params) => apiListUsers(env, params.id ?? '')),
  route('POST', '/api/scim-servers/:id/users', (req, env, params) => apiCreateUser(req, env, params.id ?? '')),
  route('PUT', '/api/scim-servers/:id/users/:userId', (req, env, params) => apiUpdateUser(req, env, params.id ?? '', params.userId ?? '')),
  route('DELETE', '/api/scim-servers/:id/users/:userId', (_req, env, params) => apiDeleteUser(env, params.id ?? '', params.userId ?? '')),

  // SCIM group management (UI API)
  route('GET', '/api/scim-servers/:id/groups', (_req, env, params) => apiListGroups(env, params.id ?? '')),
  route('POST', '/api/scim-servers/:id/groups', (req, env, params) => apiCreateGroup(req, env, params.id ?? '')),
  route('PUT', '/api/scim-servers/:id/groups/:groupId', (req, env, params) => apiUpdateGroup(req, env, params.id ?? '', params.groupId ?? '')),
  route('DELETE', '/api/scim-servers/:id/groups/:groupId', (_req, env, params) => apiDeleteGroup(env, params.id ?? '', params.groupId ?? '')),
  route('POST', '/api/scim-servers/:id/groups/:groupId/members', (req, env, params) => apiAddGroupMember(req, env, params.id ?? '', params.groupId ?? '')),
  route('DELETE', '/api/scim-servers/:id/groups/:groupId/members/:userId', (_req, env, params) => apiRemoveGroupMember(env, params.id ?? '', params.groupId ?? '', params.userId ?? '')),

  // SCIM discovery endpoints
  route('GET', '/scim/:serverId/v2/ServiceProviderConfig', (req, env, params, url, ctx) => scimServiceProviderConfig(req, env, ctx, params.serverId ?? '', url)),
  route('GET', '/scim/:serverId/v2/ResourceTypes', (req, env, params, url, ctx) => scimResourceTypes(req, env, ctx, params.serverId ?? '', url)),
  route('GET', '/scim/:serverId/v2/Schemas', (req, env, params, url, ctx) => scimSchemasEndpoint(req, env, ctx, params.serverId ?? '', url)),
  route('GET', '/scim/:serverId/v2/_stats', (req, env, params, _url, ctx) => scimCountResources(req, env, ctx, params.serverId ?? '')),

  // SCIM Users REST API
  route('GET', '/scim/:serverId/v2/Users', (req, env, params, url, ctx) => scimListUsers(req, env, ctx, params.serverId ?? '', url)),
  route('POST', '/scim/:serverId/v2/Users', (req, env, params, url, ctx) => scimCreateUser(req, env, ctx, params.serverId ?? '', url)),
  route('GET', '/scim/:serverId/v2/Users/:userId', (req, env, params, url, ctx) => scimGetUser(req, env, ctx, params.serverId ?? '', params.userId ?? '', url)),
  route('PUT', '/scim/:serverId/v2/Users/:userId', (req, env, params, url, ctx) => scimReplaceUser(req, env, ctx, params.serverId ?? '', params.userId ?? '', url)),
  route('PATCH', '/scim/:serverId/v2/Users/:userId', (req, env, params, url, ctx) => scimPatchUser(req, env, ctx, params.serverId ?? '', params.userId ?? '', url)),
  route('DELETE', '/scim/:serverId/v2/Users/:userId', (req, env, params, _url, ctx) => scimDeleteUser(req, env, ctx, params.serverId ?? '', params.userId ?? '')),

  // SCIM Groups REST API
  route('GET', '/scim/:serverId/v2/Groups', (req, env, params, url, ctx) => scimListGroups(req, env, ctx, params.serverId ?? '', url)),
  route('POST', '/scim/:serverId/v2/Groups', (req, env, params, url, ctx) => scimCreateGroup(req, env, ctx, params.serverId ?? '', url)),
  route('GET', '/scim/:serverId/v2/Groups/:groupId', (req, env, params, url, ctx) => scimGetGroup(req, env, ctx, params.serverId ?? '', params.groupId ?? '', url)),
  route('PUT', '/scim/:serverId/v2/Groups/:groupId', (req, env, params, url, ctx) => scimReplaceGroup(req, env, ctx, params.serverId ?? '', params.groupId ?? '', url)),
  route('PATCH', '/scim/:serverId/v2/Groups/:groupId', (req, env, params, url, ctx) => scimPatchGroup(req, env, ctx, params.serverId ?? '', params.groupId ?? '', url)),
  route('DELETE', '/scim/:serverId/v2/Groups/:groupId', (req, env, params, _url, ctx) => scimDeleteGroup(req, env, ctx, params.serverId ?? '', params.groupId ?? '')),
]

export async function handleRoute(request: Request, env: Env, url: URL, ctx: ExecutionContext): Promise<Response> {
  for (const { method, pattern, handler } of routes) {
    const match = pattern.exec(url.href)
    if (match && (method === '*' || method === request.method)) {
      const params = match.pathname.groups as Params
      return handler(request, env, params, url, ctx)
    }
  }
  logger.warn('Route not found: %s', url.pathname)
  return new Response(null, { status: 404 })
}

function route(method: string, pathname: string, handler: Handler) {
  return { method, pattern: new URLPattern({ pathname }), handler }
}
