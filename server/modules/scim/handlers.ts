import { buildScimOpenApiSpec } from '@shared/modules/scim/openapi'
import {
  AddGroupMemberInputSchema,
  CreateGroupInputSchema,
  CreateServerInputSchema,
  CreateUserInputSchema,
  UpdateGroupInputSchema,
  UpdateUserInputSchema,
} from '@shared/modules/scim/schemas'
import { logger } from '@shared/utils/logger'
import type { BaseIssue, BaseSchema, InferOutput } from 'valibot'
import { safeParse } from 'valibot'
import { SAMPLE_GROUPS, SAMPLE_USERS } from './fixtures'
import { allowResponse, buildFormattedName } from './logic'
import { createRepository, type ScimRepository } from './repository'

const MAX_BODY_SIZE = 1_048_576 // 1 MB

async function parseBody<T extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  request: Request,
  schema: T,
): Promise<InferOutput<T> | Response> {
  const contentLength = Number(request.headers.get('Content-Length') ?? '0')
  if (contentLength > MAX_BODY_SIZE) {
    return allowResponse({ error: 'body_too_large' }, 413)
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return allowResponse({ error: 'invalid_json' }, 400)
  }
  const result = safeParse(schema, raw)
  if (!result.success) {
    return allowResponse({ error: 'invalid_body' }, 400)
  }
  return result.output
}

async function requireServerExists(repo: ScimRepository, serverId: string): Promise<Response | null> {
  const server = await repo.findServer(serverId)
  return server ? null : allowResponse({ error: 'server_not_found' }, 404)
}

export async function apiCreateServer(request: Request, env: Env): Promise<Response> {
  const inputOrError = await parseBody(request, CreateServerInputSchema)
  if (inputOrError instanceof Response) {
    return inputOrError
  }
  const input = inputOrError

  const name = (input.name ?? '').trim()
  if (!name) {
    return allowResponse({ error: 'name_required' }, 400)
  }

  const repo = createRepository(env)
  const now = new Date().toISOString()
  const bearerToken = crypto.randomUUID()
  const server = await repo.createServer({ id: crypto.randomUUID(), name, bearerToken, createdAt: now })
  logger.info('[SCIM] Created server id="%s" name="%s"', server.id, server.name)

  if (input.prepopulate) {
    await prepopulateServer(repo, server.id, now)
    logger.info('[SCIM] Prepopulated server id="%s"', server.id)
  }

  return allowResponse(server, 201)
}

export async function apiGetServer(env: Env, serverId: string): Promise<Response> {
  const repo = createRepository(env)
  const server = await repo.findServer(serverId)
  if (!server) {
    return allowResponse({ error: 'server_not_found' }, 404)
  }
  const [userCount, groupCount] = await Promise.all([repo.countUsers(serverId), repo.countGroups(serverId)])
  return allowResponse({ ...server, userCount, groupCount })
}

export async function apiDeleteServer(env: Env, serverId: string): Promise<Response> {
  const repo = createRepository(env)
  const notFound = await requireServerExists(repo, serverId)
  if (notFound) {
    return notFound
  }
  await repo.deleteServer(serverId)
  logger.info('[SCIM] Deleted server id="%s"', serverId)
  return allowResponse({ deleted: true })
}

export async function apiListUsers(env: Env, serverId: string): Promise<Response> {
  const repo = createRepository(env)
  const notFound = await requireServerExists(repo, serverId)
  if (notFound) {
    return notFound
  }
  const users = await repo.listUsers(serverId)
  return allowResponse({ users, total: users.length })
}

export async function apiCreateUser(request: Request, env: Env, serverId: string): Promise<Response> {
  const repo = createRepository(env)
  const notFound = await requireServerExists(repo, serverId)
  if (notFound) {
    return notFound
  }

  const inputOrError = await parseBody(request, CreateUserInputSchema)
  if (inputOrError instanceof Response) {
    return inputOrError
  }
  const input = inputOrError

  const userName = (input.userName ?? '').trim()
  if (!userName) {
    return allowResponse({ error: 'userName_required' }, 400)
  }

  const now = new Date().toISOString()
  const user = await repo.createUser({
    id: crypto.randomUUID(),
    serverId,
    externalId: input.externalId?.trim() || null,
    userName,
    displayName: input.displayName?.trim() || null,
    name: {
      givenName: input.givenName?.trim() || null,
      middleName: input.middleName?.trim() || null,
      familyName: input.familyName?.trim() || null,
      formatted: buildFormattedName({ givenName: input.givenName, middleName: input.middleName, familyName: input.familyName }),
    },
    title: input.title?.trim() || null,
    preferredLanguage: input.preferredLanguage?.trim() || null,
    locale: input.locale?.trim() || null,
    timezone: input.timezone?.trim() || null,
    active: input.active ?? true,
    emails: input.emails ?? [],
    createdAt: now,
    updatedAt: now,
  })

  logger.info('[SCIM] Created user id="%s" userName="%s" on server="%s"', user.id, user.userName, serverId)
  return allowResponse(user, 201)
}

export async function apiUpdateUser(request: Request, env: Env, serverId: string, userId: string): Promise<Response> {
  const repo = createRepository(env)
  const notFound = await requireServerExists(repo, serverId)
  if (notFound) {
    return notFound
  }

  const existing = await repo.findUser(serverId, userId)
  if (!existing) {
    return allowResponse({ error: 'user_not_found' }, 404)
  }

  const inputOrError = await parseBody(request, UpdateUserInputSchema)
  if (inputOrError instanceof Response) {
    return inputOrError
  }
  const input = inputOrError

  const now = new Date().toISOString()
  const updated = await repo.updateUser({
    ...existing,
    externalId: input.externalId !== undefined ? input.externalId?.trim() || null : existing.externalId,
    userName: input.userName?.trim() || existing.userName,
    displayName: input.displayName !== undefined ? input.displayName?.trim() || null : existing.displayName,
    name: {
      givenName: input.givenName !== undefined ? input.givenName?.trim() || null : existing.name?.givenName,
      middleName: input.middleName !== undefined ? input.middleName?.trim() || null : existing.name?.middleName,
      familyName: input.familyName !== undefined ? input.familyName?.trim() || null : existing.name?.familyName,
      formatted: buildFormattedName({
        givenName: input.givenName ?? existing.name?.givenName ?? null,
        middleName: input.middleName ?? existing.name?.middleName ?? null,
        familyName: input.familyName ?? existing.name?.familyName ?? null,
      }),
    },
    title: input.title !== undefined ? input.title?.trim() || null : existing.title,
    preferredLanguage: input.preferredLanguage !== undefined ? input.preferredLanguage?.trim() || null : existing.preferredLanguage,
    locale: input.locale !== undefined ? input.locale?.trim() || null : existing.locale,
    timezone: input.timezone !== undefined ? input.timezone?.trim() || null : existing.timezone,
    active: input.active !== undefined ? input.active : existing.active,
    emails: input.emails !== undefined ? input.emails : existing.emails,
    updatedAt: now,
  })

  return allowResponse(updated)
}

export async function apiDeleteUser(env: Env, serverId: string, userId: string): Promise<Response> {
  const repo = createRepository(env)
  const notFound = await requireServerExists(repo, serverId)
  if (notFound) {
    return notFound
  }

  const existing = await repo.findUser(serverId, userId)
  if (!existing) {
    return allowResponse({ error: 'user_not_found' }, 404)
  }

  await repo.deleteUser(serverId, userId)
  logger.info('[SCIM] Deleted user id="%s" on server="%s"', userId, serverId)
  return allowResponse({ deleted: true })
}

export async function apiListGroups(env: Env, serverId: string): Promise<Response> {
  const repo = createRepository(env)
  const notFound = await requireServerExists(repo, serverId)
  if (notFound) {
    return notFound
  }
  const groups = await repo.listGroups(serverId)
  return allowResponse({ groups, total: groups.length })
}

export async function apiCreateGroup(request: Request, env: Env, serverId: string): Promise<Response> {
  const repo = createRepository(env)
  const notFound = await requireServerExists(repo, serverId)
  if (notFound) {
    return notFound
  }

  const inputOrError = await parseBody(request, CreateGroupInputSchema)
  if (inputOrError instanceof Response) {
    return inputOrError
  }
  const input = inputOrError

  const displayName = (input.displayName ?? '').trim()
  if (!displayName) {
    return allowResponse({ error: 'displayName_required' }, 400)
  }

  const now = new Date().toISOString()
  const group = await repo.createGroup({
    id: crypto.randomUUID(),
    serverId,
    externalId: input.externalId?.trim() || null,
    displayName,
    members: [],
    createdAt: now,
    updatedAt: now,
  })

  if (input.memberIds && input.memberIds.length > 0) {
    await repo.addGroupMembers(group.id, input.memberIds)
  }

  logger.info('[SCIM] Created group id="%s" displayName="%s" on server="%s"', group.id, group.displayName, serverId)
  return allowResponse(group, 201)
}

export async function apiUpdateGroup(request: Request, env: Env, serverId: string, groupId: string): Promise<Response> {
  const repo = createRepository(env)
  const notFound = await requireServerExists(repo, serverId)
  if (notFound) {
    return notFound
  }

  const existing = await repo.findGroup(serverId, groupId)
  if (!existing) {
    return allowResponse({ error: 'group_not_found' }, 404)
  }

  const inputOrError = await parseBody(request, UpdateGroupInputSchema)
  if (inputOrError instanceof Response) {
    return inputOrError
  }
  const input = inputOrError

  const now = new Date().toISOString()
  await repo.updateGroup({
    ...existing,
    externalId: input.externalId !== undefined ? input.externalId?.trim() || null : existing.externalId,
    displayName: input.displayName?.trim() || existing.displayName,
    updatedAt: now,
  })

  if (input.memberIds !== undefined) {
    await repo.replaceGroupMembers(groupId, input.memberIds)
  }

  const updated = await repo.findGroup(serverId, groupId)
  return allowResponse(updated)
}

export async function apiDeleteGroup(env: Env, serverId: string, groupId: string): Promise<Response> {
  const repo = createRepository(env)
  const notFound = await requireServerExists(repo, serverId)
  if (notFound) {
    return notFound
  }

  const existing = await repo.findGroup(serverId, groupId)
  if (!existing) {
    return allowResponse({ error: 'group_not_found' }, 404)
  }

  await repo.deleteGroup(serverId, groupId)
  logger.info('[SCIM] Deleted group id="%s" on server="%s"', groupId, serverId)
  return allowResponse({ deleted: true })
}

export async function apiAddGroupMember(request: Request, env: Env, serverId: string, groupId: string): Promise<Response> {
  const repo = createRepository(env)
  const group = await repo.findGroup(serverId, groupId)
  if (!group) {
    return allowResponse({ error: 'group_not_found' }, 404)
  }

  const inputOrError = await parseBody(request, AddGroupMemberInputSchema)
  if (inputOrError instanceof Response) {
    return inputOrError
  }
  const input = inputOrError

  const user = await repo.findUser(serverId, input.userId)
  if (!user) {
    return allowResponse({ error: 'user_not_found' }, 404)
  }

  await repo.addGroupMembers(groupId, [input.userId])
  return allowResponse({ added: true })
}

export async function apiRemoveGroupMember(env: Env, serverId: string, groupId: string, userId: string): Promise<Response> {
  const repo = createRepository(env)
  const group = await repo.findGroup(serverId, groupId)
  if (!group) {
    return allowResponse({ error: 'group_not_found' }, 404)
  }

  await repo.removeGroupMembers(groupId, [userId])
  return allowResponse({ removed: true })
}

export async function apiGetScimOpenApiSpec(request: Request, env: Env, serverId: string): Promise<Response> {
  const repo = createRepository(env)
  const notFound = await requireServerExists(repo, serverId)
  if (notFound) {
    return notFound
  }
  const origin = new URL(request.url).origin
  const spec = buildScimOpenApiSpec(`${origin}/scim/${serverId}/v2`)
  return allowResponse(spec)
}

async function prepopulateServer(repo: ReturnType<typeof createRepository>, serverId: string, now: string): Promise<void> {
  const createdUsers = await Promise.all(
    SAMPLE_USERS.map(sample =>
      repo.createUser({
        id: crypto.randomUUID(),
        serverId,
        userName: sample.userName,
        displayName: sample.displayName,
        name: { givenName: sample.givenName, familyName: sample.familyName, formatted: `${sample.givenName} ${sample.familyName}` },
        title: sample.title,
        active: sample.active,
        emails: [{ value: sample.email, type: 'work', primary: true }],
        createdAt: now,
        updatedAt: now,
      }),
    ),
  )

  const usersByName = new Map(createdUsers.map(user => [user.userName, user.id]))

  await Promise.all(
    SAMPLE_GROUPS.map(async sample => {
      const group = await repo.createGroup({
        id: crypto.randomUUID(),
        serverId,
        displayName: sample.displayName,
        members: [],
        createdAt: now,
        updatedAt: now,
      })
      const memberIds = sample.memberUserNames.map(name => usersByName.get(name)).filter((id): id is string => id !== undefined)
      if (memberIds.length > 0) {
        await repo.addGroupMembers(group.id, memberIds)
      }
    }),
  )
}
