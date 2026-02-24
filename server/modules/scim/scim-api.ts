import { PatchOpSchema, ScimGroupBodySchema, ScimUserBodySchema } from '@shared/modules/scim/schemas'
import type { ScimGroup, ScimUser } from '@shared/modules/scim/types'
import { logger } from '@shared/utils/logger'
import type { BaseIssue, BaseSchema, InferOutput } from 'valibot'
import { safeParse } from 'valibot'
import {
  applyPatchToGroup,
  applyPatchToUser,
  buildErrorResponse,
  buildFormattedName,
  buildGroupResponse,
  buildGroupSqlFilter,
  buildListResponse,
  buildResourceTypes,
  buildSchemas,
  buildScimResponse,
  buildServiceProviderConfig,
  buildUserResponse,
  buildUserSqlFilter,
  getScimBaseUrl,
  matchesFilter,
  matchesGroupFilter,
  parseCount,
  parseScimFilter,
  parseStartIndex,
  SCIM_GROUP_SCHEMA,
  SCIM_PATCH_SCHEMA,
  SCIM_USER_SCHEMA,
} from './logic'
import { createRepository, type ScimRepository } from './repository'

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('UNIQUE constraint failed')
}

const MAX_BODY_SIZE = 1_048_576 // 1 MB

async function parseScimBody<T extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  request: Request,
  schema: T,
): Promise<InferOutput<T> | Response> {
  const contentLength = Number(request.headers.get('Content-Length') ?? '0')
  if (contentLength > MAX_BODY_SIZE) {
    return buildScimResponse(buildErrorResponse(413, 'Request body too large.'), 413)
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return buildScimResponse(buildErrorResponse(400, 'Invalid JSON body.'), 400)
  }
  const result = safeParse(schema, raw)
  if (!result.success) {
    const detail = result.issues.map(i => i.message).join('; ')
    return buildScimResponse(buildErrorResponse(400, `Invalid request body: ${detail}`, 'invalidValue'), 400)
  }
  return result.output
}

function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const bufferA = encoder.encode(a)
  const bufferB = encoder.encode(b)
  if (bufferA.byteLength !== bufferB.byteLength) {
    // Compare against self to keep constant time, then return false
    crypto.subtle.timingSafeEqual(bufferA, bufferA)
    return false
  }
  return crypto.subtle.timingSafeEqual(bufferA, bufferB)
}

async function requireServer(
  repo: ScimRepository,
  serverId: string,
  ctx: ExecutionContext,
  request: Request,
): Promise<{ notFound: Response } | null> {
  const server = await repo.findServer(serverId)
  if (!server) {
    return { notFound: buildScimResponse(buildErrorResponse(404, 'SCIM server not found.'), 404) }
  }

  const storedToken = await repo.findServerBearerToken(serverId)
  if (storedToken) {
    const authHeader = request.headers.get('Authorization') ?? ''
    const prefix = 'Bearer '
    if (!authHeader.startsWith(prefix) || !timingSafeEqual(authHeader.slice(prefix.length), storedToken)) {
      return { notFound: buildScimResponse(buildErrorResponse(401, 'Invalid or missing bearer token.'), 401) }
    }
  }

  ctx.waitUntil(repo.touchServerLastUsed(serverId))
  return null
}

export async function scimListUsers(request: Request, env: Env, ctx: ExecutionContext, serverId: string, url: URL): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }

  const filter = parseScimFilter(url.searchParams.get('filter'))
  const startIndex = parseStartIndex(url.searchParams.get('startIndex'))
  const count = parseCount(url.searchParams.get('count'))
  const baseUrl = getScimBaseUrl(url, serverId)

  const sqlFilter = buildUserSqlFilter(serverId, filter)

  let totalResults: number
  let page: ScimUser[]

  if (sqlFilter.requiresInMemoryFilter) {
    const allUsers = await repo.listUsers(serverId)
    const filtered = allUsers.filter(user => matchesFilter(filter, user))
    totalResults = filtered.length
    page = filtered.slice(startIndex - 1, startIndex - 1 + count)
  } else {
    totalResults = await repo.countUsersFiltered(serverId, sqlFilter.where)
    page = await repo.listUsersPaginated(serverId, {
      where: sqlFilter.where,
      limit: count,
      offset: startIndex - 1,
    })
  }

  const resources = page.map(user => buildUserResponse(user, baseUrl))

  logger.info('[SCIM API] List Users: server="%s" total=%d page=%d', serverId, totalResults, page.length)
  return buildScimResponse(buildListResponse(resources, totalResults, startIndex, count))
}

export async function scimGetUser(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  serverId: string,
  userId: string,
  url: URL,
): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }

  const baseUrl = getScimBaseUrl(url, serverId)
  const user = await repo.findUser(serverId, userId)
  if (!user) {
    return buildScimResponse(buildErrorResponse(404, `User '${userId}' not found.`, 'noTarget'), 404)
  }

  return buildScimResponse(buildUserResponse(user, baseUrl))
}

export async function scimCreateUser(request: Request, env: Env, ctx: ExecutionContext, serverId: string, url: URL): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }

  const bodyOrError = await parseScimBody(request, ScimUserBodySchema)
  if (bodyOrError instanceof Response) {
    return bodyOrError
  }
  const body = bodyOrError

  const userName = body.userName?.trim()
  if (!userName) {
    return buildScimResponse(buildErrorResponse(400, 'userName is required.', 'invalidValue'), 400)
  }

  const now = new Date().toISOString()
  const nameObj = body.name

  try {
    const user = await repo.createUser({
      id: crypto.randomUUID(),
      serverId,
      externalId: body.externalId ?? null,
      userName,
      displayName: body.displayName?.trim() || null,
      name: {
        formatted: nameObj?.formatted ?? buildFormattedName({ givenName: nameObj?.givenName, familyName: nameObj?.familyName }),
        givenName: nameObj?.givenName ?? null,
        familyName: nameObj?.familyName ?? null,
        middleName: nameObj?.middleName ?? null,
      },
      title: body.title?.trim() || null,
      preferredLanguage: body.preferredLanguage || null,
      locale: body.locale || null,
      timezone: body.timezone || null,
      active: body.active !== undefined ? body.active : true,
      emails: body.emails ?? [],
      phoneNumbers: body.phoneNumbers ?? [],
      addresses: body.addresses ?? [],
      createdAt: now,
      updatedAt: now,
    })

    const baseUrl = getScimBaseUrl(url, serverId)
    logger.info('[SCIM API] Create User: server="%s" user="%s"', serverId, user.id)
    return buildScimResponse(buildUserResponse(user, baseUrl), 201)
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return buildScimResponse(buildErrorResponse(409, `User with userName '${userName}' already exists.`, 'uniqueness'), 409)
    }
    throw error
  }
}

export async function scimReplaceUser(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  serverId: string,
  userId: string,
  url: URL,
): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }

  const existing = await repo.findUser(serverId, userId)
  if (!existing) {
    return buildScimResponse(buildErrorResponse(404, `User '${userId}' not found.`, 'noTarget'), 404)
  }

  const bodyOrError = await parseScimBody(request, ScimUserBodySchema)
  if (bodyOrError instanceof Response) {
    return bodyOrError
  }
  const body = bodyOrError

  const userName = body.userName?.trim()
  if (!userName) {
    return buildScimResponse(buildErrorResponse(400, 'userName is required.', 'invalidValue'), 400)
  }

  const nameObj = body.name
  const now = new Date().toISOString()
  const updated = await repo.updateUser({
    ...existing,
    externalId: body.externalId ?? null,
    userName,
    displayName: body.displayName?.trim() || null,
    name: {
      formatted: nameObj?.formatted ?? null,
      givenName: nameObj?.givenName ?? null,
      familyName: nameObj?.familyName ?? null,
      middleName: nameObj?.middleName ?? null,
    },
    title: body.title?.trim() || null,
    preferredLanguage: body.preferredLanguage || null,
    locale: body.locale || null,
    timezone: body.timezone || null,
    active: body.active !== undefined ? body.active : true,
    emails: body.emails ?? [],
    phoneNumbers: body.phoneNumbers ?? [],
    addresses: body.addresses ?? [],
    updatedAt: now,
  })

  const baseUrl = getScimBaseUrl(url, serverId)
  logger.info('[SCIM API] Replace User: server="%s" user="%s"', serverId, userId)
  return buildScimResponse(buildUserResponse(updated, baseUrl))
}

export async function scimPatchUser(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  serverId: string,
  userId: string,
  url: URL,
): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }

  const existing = await repo.findUser(serverId, userId)
  if (!existing) {
    return buildScimResponse(buildErrorResponse(404, `User '${userId}' not found.`, 'noTarget'), 404)
  }

  const bodyOrError = await parseScimBody(request, PatchOpSchema)
  if (bodyOrError instanceof Response) {
    return bodyOrError
  }
  const body = bodyOrError

  if (!body.schemas?.includes(SCIM_PATCH_SCHEMA)) {
    return buildScimResponse(buildErrorResponse(400, `Request must include schema '${SCIM_PATCH_SCHEMA}'.`, 'invalidValue'), 400)
  }

  const patched = applyPatchToUser(existing, body.Operations ?? [])
  const now = new Date().toISOString()
  const updated = await repo.updateUser({ ...patched, updatedAt: now })

  const baseUrl = getScimBaseUrl(url, serverId)
  logger.info('[SCIM API] Patch User: server="%s" user="%s"', serverId, userId)
  return buildScimResponse(buildUserResponse(updated, baseUrl))
}

export async function scimDeleteUser(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  serverId: string,
  userId: string,
): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }

  const existing = await repo.findUser(serverId, userId)
  if (!existing) {
    return buildScimResponse(buildErrorResponse(404, `User '${userId}' not found.`, 'noTarget'), 404)
  }

  await repo.deleteUser(serverId, userId)
  logger.info('[SCIM API] Delete User: server="%s" user="%s"', serverId, userId)
  return new Response(null, { status: 204 })
}

export async function scimListGroups(request: Request, env: Env, ctx: ExecutionContext, serverId: string, url: URL): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }

  const filter = parseScimFilter(url.searchParams.get('filter'))
  const startIndex = parseStartIndex(url.searchParams.get('startIndex'))
  const count = parseCount(url.searchParams.get('count'))
  const baseUrl = getScimBaseUrl(url, serverId)

  const sqlFilter = buildGroupSqlFilter(serverId, filter)

  let totalResults: number
  let page: ScimGroup[]

  if (sqlFilter.requiresInMemoryFilter) {
    const allGroups = await repo.listGroups(serverId)
    const filtered = allGroups.filter(group => matchesGroupFilter(filter, group))
    totalResults = filtered.length
    page = filtered.slice(startIndex - 1, startIndex - 1 + count)
  } else {
    totalResults = await repo.countGroupsFiltered(serverId, sqlFilter.where)
    page = await repo.listGroupsPaginated(serverId, {
      where: sqlFilter.where,
      limit: count,
      offset: startIndex - 1,
    })
  }

  const resources = page.map(group => buildGroupResponse(group, baseUrl))

  logger.info('[SCIM API] List Groups: server="%s" total=%d page=%d', serverId, totalResults, page.length)
  return buildScimResponse(buildListResponse(resources, totalResults, startIndex, count))
}

export async function scimGetGroup(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  serverId: string,
  groupId: string,
  url: URL,
): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }

  const group = await repo.findGroup(serverId, groupId)
  if (!group) {
    return buildScimResponse(buildErrorResponse(404, `Group '${groupId}' not found.`, 'noTarget'), 404)
  }

  const baseUrl = getScimBaseUrl(url, serverId)
  return buildScimResponse(buildGroupResponse(group, baseUrl))
}

export async function scimCreateGroup(request: Request, env: Env, ctx: ExecutionContext, serverId: string, url: URL): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }

  const bodyOrError = await parseScimBody(request, ScimGroupBodySchema)
  if (bodyOrError instanceof Response) {
    return bodyOrError
  }
  const body = bodyOrError

  const displayName = body.displayName?.trim()
  if (!displayName) {
    return buildScimResponse(buildErrorResponse(400, 'displayName is required.', 'invalidValue'), 400)
  }

  const members = body.members ?? []
  const now = new Date().toISOString()
  const created = await repo.createGroup({
    id: crypto.randomUUID(),
    serverId,
    externalId: body.externalId ?? null,
    displayName,
    members: members.map(m => ({ value: m.value, display: m.display })),
    createdAt: now,
    updatedAt: now,
  })

  const group = (await repo.findGroup(serverId, created.id)) ?? created
  const baseUrl = getScimBaseUrl(url, serverId)
  logger.info('[SCIM API] Create Group: server="%s" group="%s"', serverId, group.id)
  return buildScimResponse(buildGroupResponse(group, baseUrl), 201)
}

export async function scimReplaceGroup(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  serverId: string,
  groupId: string,
  url: URL,
): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }

  const existing = await repo.findGroup(serverId, groupId)
  if (!existing) {
    return buildScimResponse(buildErrorResponse(404, `Group '${groupId}' not found.`, 'noTarget'), 404)
  }

  const bodyOrError = await parseScimBody(request, ScimGroupBodySchema)
  if (bodyOrError instanceof Response) {
    return bodyOrError
  }
  const body = bodyOrError

  const displayName = body.displayName?.trim()
  if (!displayName) {
    return buildScimResponse(buildErrorResponse(400, 'displayName is required.', 'invalidValue'), 400)
  }

  const members = body.members ?? []
  const now = new Date().toISOString()
  const updated = await repo.updateGroup({ ...existing, displayName, updatedAt: now })
  await repo.replaceGroupMembers(
    groupId,
    members.map(m => m.value),
  )

  const refreshed = (await repo.findGroup(serverId, groupId)) ?? { ...updated, members: [] }
  const baseUrl = getScimBaseUrl(url, serverId)
  logger.info('[SCIM API] Replace Group: server="%s" group="%s"', serverId, groupId)
  return buildScimResponse(buildGroupResponse(refreshed, baseUrl))
}

export async function scimPatchGroup(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  serverId: string,
  groupId: string,
  url: URL,
): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }

  const existing = await repo.findGroup(serverId, groupId)
  if (!existing) {
    return buildScimResponse(buildErrorResponse(404, `Group '${groupId}' not found.`, 'noTarget'), 404)
  }

  const bodyOrError = await parseScimBody(request, PatchOpSchema)
  if (bodyOrError instanceof Response) {
    return bodyOrError
  }
  const body = bodyOrError

  const patch = applyPatchToGroup(body.Operations ?? [])
  const now = new Date().toISOString()

  if (patch.displayName) {
    await repo.updateGroup({ ...existing, displayName: patch.displayName, updatedAt: now })
  }

  for (const memberPatch of patch.memberPatches) {
    switch (memberPatch.kind) {
      case 'replace_all':
        await repo.replaceGroupMembers(groupId, memberPatch.ids)
        break
      case 'remove_all':
        await repo.replaceGroupMembers(groupId, [])
        break
      case 'remove':
        await repo.removeGroupMembers(groupId, memberPatch.ids)
        break
      case 'add':
        await repo.addGroupMembers(groupId, memberPatch.ids)
        break
    }
  }

  const refreshed = (await repo.findGroup(serverId, groupId)) ?? existing
  const baseUrl = getScimBaseUrl(url, serverId)
  logger.info('[SCIM API] Patch Group: server="%s" group="%s"', serverId, groupId)
  return buildScimResponse(buildGroupResponse(refreshed, baseUrl))
}

export async function scimDeleteGroup(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  serverId: string,
  groupId: string,
): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }

  const existing = await repo.findGroup(serverId, groupId)
  if (!existing) {
    return buildScimResponse(buildErrorResponse(404, `Group '${groupId}' not found.`, 'noTarget'), 404)
  }

  await repo.deleteGroup(serverId, groupId)
  logger.info('[SCIM API] Delete Group: server="%s" group="%s"', serverId, groupId)
  return new Response(null, { status: 204 })
}

export async function scimServiceProviderConfig(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  serverId: string,
  url: URL,
): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }
  const baseUrl = getScimBaseUrl(url, serverId)
  return buildScimResponse(buildServiceProviderConfig(baseUrl))
}

export async function scimResourceTypes(request: Request, env: Env, ctx: ExecutionContext, serverId: string, url: URL): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }
  const baseUrl = getScimBaseUrl(url, serverId)
  return buildScimResponse(buildResourceTypes(baseUrl))
}

export async function scimSchemasEndpoint(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  serverId: string,
  url: URL,
): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }
  const baseUrl = getScimBaseUrl(url, serverId)
  return buildScimResponse(buildSchemas(baseUrl))
}

export async function scimCountResources(request: Request, env: Env, ctx: ExecutionContext, serverId: string): Promise<Response> {
  const repo = createRepository(env)
  const missing = await requireServer(repo, serverId, ctx, request)
  if (missing) {
    return missing.notFound
  }
  const [userCount, groupCount] = await Promise.all([repo.countUsers(serverId), repo.countGroups(serverId)])
  return buildScimResponse({ userCount, groupCount })
}

// Re-export types for external use
export type { ScimUser, ScimGroup }

// Export schema URNs
export { SCIM_USER_SCHEMA, SCIM_GROUP_SCHEMA }
