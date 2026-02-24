import { ScimAddressSchema, ScimEmailSchema, ScimPhoneNumberSchema } from '@shared/modules/scim/schemas'
import type { ScimGroup, ScimGroupRef, ScimMember, ScimServer, ScimUser } from '@shared/modules/scim/types'
import { logger } from '@shared/utils/logger'
import { and, eq, inArray, lt, type SQL, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import type { ArraySchema, BaseIssue, BaseSchema, InferOutput } from 'valibot'
import { array, safeParse } from 'valibot'
import { scimGroup, scimGroupMember, scimServer, scimUser } from '../../db/schema'

export type ScimRepository = ReturnType<typeof buildRepository>

const repositoryCache = new WeakMap<D1Database, ScimRepository>()

export function createRepository(env: Env): ScimRepository {
  const cached = repositoryCache.get(env.DB)
  if (cached) {
    return cached
  }
  const repo = buildRepository(env)
  repositoryCache.set(env.DB, repo)
  return repo
}

function buildRepository(env: Env) {
  const db = drizzle(env.DB, { schema: { scimServer, scimUser, scimGroup, scimGroupMember } })

  async function findServer(id: string): Promise<ScimServer | null> {
    try {
      const row = await db.select().from(scimServer).where(eq(scimServer.id, id)).get()
      return row ? { id: row.id, name: row.name, createdAt: row.createdAt } : null
    } catch (error: unknown) {
      logger.error('[SCIM] Failed to find server %s: %o', id, error)
      return null
    }
  }

  async function createServer(server: ScimServer): Promise<ScimServer> {
    await db.insert(scimServer).values({
      id: server.id,
      name: server.name,
      bearerToken: server.bearerToken ?? null,
      createdAt: server.createdAt,
      lastUsedAt: server.createdAt,
    })
    return server
  }

  async function findServerBearerToken(id: string): Promise<string | null> {
    try {
      const row = await db.select({ bearerToken: scimServer.bearerToken }).from(scimServer).where(eq(scimServer.id, id)).get()
      return row?.bearerToken ?? null
    } catch (error: unknown) {
      logger.error('[SCIM] Failed to find server bearer token %s: %o', id, error)
      return null
    }
  }

  async function deleteServer(id: string): Promise<void> {
    await db.delete(scimServer).where(eq(scimServer.id, id))
  }

  async function touchServerLastUsed(serverId: string): Promise<void> {
    await db.update(scimServer).set({ lastUsedAt: new Date().toISOString() }).where(eq(scimServer.id, serverId))
  }

  async function deleteStaleServers(): Promise<void> {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - 2)
    const cutoffIso = cutoff.toISOString()
    await db.delete(scimServer).where(lt(sql`COALESCE(${scimServer.lastUsedAt}, ${scimServer.createdAt})`, cutoffIso))
    logger.info('[SCIM] Deleted stale servers older than %s', cutoffIso)
  }

  async function addGroupMembers(groupId: string, userIds: string[]): Promise<void> {
    if (userIds.length === 0) {
      return
    }
    await db
      .insert(scimGroupMember)
      .values(userIds.map(userId => ({ groupId, userId })))
      .onConflictDoNothing()
  }

  async function removeGroupMembers(groupId: string, userIds: string[]): Promise<void> {
    if (userIds.length === 0) {
      return
    }
    await db.delete(scimGroupMember).where(and(eq(scimGroupMember.groupId, groupId), inArray(scimGroupMember.userId, userIds)))
  }

  async function attachGroupsToUsers(serverId: string, users: ScimUser[]): Promise<ScimUser[]> {
    if (users.length === 0) {
      return users
    }
    const userIds = users.map(user => user.id)
    const memberships = await db
      .select({ userId: scimGroupMember.userId, groupId: scimGroupMember.groupId, displayName: scimGroup.displayName })
      .from(scimGroupMember)
      .innerJoin(scimGroup, and(eq(scimGroupMember.groupId, scimGroup.id), eq(scimGroup.serverId, serverId)))
      .where(inArray(scimGroupMember.userId, userIds))
      .all()

    const groupsByUserId = new Map<string, ScimGroupRef[]>()
    for (const row of memberships) {
      const existing = groupsByUserId.get(row.userId) ?? []
      existing.push({ value: row.groupId, display: row.displayName, type: 'direct' })
      groupsByUserId.set(row.userId, existing)
    }

    return users.map(user => ({ ...user, groups: groupsByUserId.get(user.id) ?? [] }))
  }

  async function attachMembersToGroups(groups: ScimGroup[]): Promise<ScimGroup[]> {
    if (groups.length === 0) {
      return groups
    }
    const groupIds = groups.map(group => group.id)
    const memberships = await db
      .select({
        groupId: scimGroupMember.groupId,
        userId: scimGroupMember.userId,
        userName: scimUser.userName,
        displayName: scimUser.displayName,
      })
      .from(scimGroupMember)
      .innerJoin(scimUser, eq(scimGroupMember.userId, scimUser.id))
      .where(inArray(scimGroupMember.groupId, groupIds))
      .all()

    const membersByGroupId = new Map<string, ScimMember[]>()
    for (const row of memberships) {
      const existing = membersByGroupId.get(row.groupId) ?? []
      existing.push({ value: row.userId, display: row.displayName ?? row.userName })
      membersByGroupId.set(row.groupId, existing)
    }

    return groups.map(group => ({ ...group, members: membersByGroupId.get(group.id) ?? [] }))
  }

  return {
    findServer,
    findServerBearerToken,
    createServer,
    deleteServer,
    touchServerLastUsed,
    deleteStaleServers,
    addGroupMembers,
    removeGroupMembers,

    async listUsers(serverId: string): Promise<ScimUser[]> {
      const rows = await db.select().from(scimUser).where(eq(scimUser.serverId, serverId)).all()
      const users = rows.map(rowToUser)
      return await attachGroupsToUsers(serverId, users)
    },

    async listUsersPaginated(serverId: string, options: { where?: SQL; limit: number; offset: number }): Promise<ScimUser[]> {
      const rows = await db
        .select()
        .from(scimUser)
        .where(options.where ?? eq(scimUser.serverId, serverId))
        .limit(options.limit)
        .offset(options.offset)
        .all()
      const users = rows.map(rowToUser)
      return await attachGroupsToUsers(serverId, users)
    },

    async countUsersFiltered(serverId: string, where?: SQL): Promise<number> {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(scimUser)
        .where(where ?? eq(scimUser.serverId, serverId))
        .get()
      return result?.count ?? 0
    },

    async findUser(serverId: string, userId: string): Promise<ScimUser | null> {
      const row = await db
        .select()
        .from(scimUser)
        .where(and(eq(scimUser.id, userId), eq(scimUser.serverId, serverId)))
        .get()
      if (!row) {
        return null
      }
      const user = rowToUser(row)
      const withGroups = await attachGroupsToUsers(serverId, [user])
      return withGroups[0] ?? null
    },

    async createUser(user: ScimUser): Promise<ScimUser> {
      await db.insert(scimUser).values({
        id: user.id,
        serverId: user.serverId,
        externalId: user.externalId ?? null,
        userName: user.userName,
        displayName: user.displayName ?? null,
        givenName: user.name?.givenName ?? null,
        familyName: user.name?.familyName ?? null,
        middleName: user.name?.middleName ?? null,
        formattedName: user.name?.formatted ?? null,
        title: user.title ?? null,
        preferredLanguage: user.preferredLanguage ?? null,
        locale: user.locale ?? null,
        timezone: user.timezone ?? null,
        active: user.active,
        emails: user.emails ? JSON.stringify(user.emails) : null,
        phoneNumbers: user.phoneNumbers ? JSON.stringify(user.phoneNumbers) : null,
        addresses: user.addresses ? JSON.stringify(user.addresses) : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      return user
    },

    async updateUser(user: ScimUser): Promise<ScimUser> {
      await db
        .update(scimUser)
        .set({
          externalId: user.externalId ?? null,
          userName: user.userName,
          displayName: user.displayName ?? null,
          givenName: user.name?.givenName ?? null,
          familyName: user.name?.familyName ?? null,
          middleName: user.name?.middleName ?? null,
          formattedName: user.name?.formatted ?? null,
          title: user.title ?? null,
          preferredLanguage: user.preferredLanguage ?? null,
          locale: user.locale ?? null,
          timezone: user.timezone ?? null,
          active: user.active,
          emails: user.emails ? JSON.stringify(user.emails) : null,
          phoneNumbers: user.phoneNumbers ? JSON.stringify(user.phoneNumbers) : null,
          addresses: user.addresses ? JSON.stringify(user.addresses) : null,
          updatedAt: user.updatedAt,
        })
        .where(and(eq(scimUser.id, user.id), eq(scimUser.serverId, user.serverId)))
      return user
    },

    async deleteUser(serverId: string, userId: string): Promise<void> {
      await db.delete(scimUser).where(and(eq(scimUser.id, userId), eq(scimUser.serverId, serverId)))
    },

    async countUsers(serverId: string): Promise<number> {
      const result = await db.select({ count: sql<number>`count(*)` }).from(scimUser).where(eq(scimUser.serverId, serverId)).get()
      return result?.count ?? 0
    },

    async listGroups(serverId: string): Promise<ScimGroup[]> {
      const rows = await db.select().from(scimGroup).where(eq(scimGroup.serverId, serverId)).all()
      const groups = rows.map(rowToGroup)
      return await attachMembersToGroups(groups)
    },

    async listGroupsPaginated(serverId: string, options: { where?: SQL; limit: number; offset: number }): Promise<ScimGroup[]> {
      const rows = await db
        .select()
        .from(scimGroup)
        .where(options.where ?? eq(scimGroup.serverId, serverId))
        .limit(options.limit)
        .offset(options.offset)
        .all()
      const groups = rows.map(rowToGroup)
      return await attachMembersToGroups(groups)
    },

    async countGroupsFiltered(serverId: string, where?: SQL): Promise<number> {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(scimGroup)
        .where(where ?? eq(scimGroup.serverId, serverId))
        .get()
      return result?.count ?? 0
    },

    async findGroup(serverId: string, groupId: string): Promise<ScimGroup | null> {
      const row = await db
        .select()
        .from(scimGroup)
        .where(and(eq(scimGroup.id, groupId), eq(scimGroup.serverId, serverId)))
        .get()
      if (!row) {
        return null
      }
      const group = rowToGroup(row)
      const withMembers = await attachMembersToGroups([group])
      return withMembers[0] ?? null
    },

    async createGroup(group: ScimGroup): Promise<ScimGroup> {
      await db.insert(scimGroup).values({
        id: group.id,
        serverId: group.serverId,
        externalId: group.externalId ?? null,
        displayName: group.displayName,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      })
      if (group.members && group.members.length > 0) {
        await addGroupMembers(
          group.id,
          group.members.map(m => m.value),
        )
      }
      return group
    },

    async updateGroup(group: ScimGroup): Promise<ScimGroup> {
      await db
        .update(scimGroup)
        .set({
          externalId: group.externalId ?? null,
          displayName: group.displayName,
          updatedAt: group.updatedAt,
        })
        .where(and(eq(scimGroup.id, group.id), eq(scimGroup.serverId, group.serverId)))
      return group
    },

    async deleteGroup(serverId: string, groupId: string): Promise<void> {
      await db.delete(scimGroup).where(and(eq(scimGroup.id, groupId), eq(scimGroup.serverId, serverId)))
    },

    async countGroups(serverId: string): Promise<number> {
      const result = await db.select({ count: sql<number>`count(*)` }).from(scimGroup).where(eq(scimGroup.serverId, serverId)).get()
      return result?.count ?? 0
    },

    async replaceGroupMembers(groupId: string, userIds: string[]): Promise<void> {
      await db.delete(scimGroupMember).where(eq(scimGroupMember.groupId, groupId))
      if (userIds.length > 0) {
        await addGroupMembers(groupId, userIds)
      }
    },
  }
}

// ─── Row mappers (pure, no DB access) ──────────────────────────────────────────

type UserRow = typeof scimUser.$inferSelect

function parseJsonColumn<T extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  raw: string | null,
  schema: ArraySchema<T, undefined>,
): InferOutput<ArraySchema<T, undefined>> {
  if (!raw) {
    return []
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    const result = safeParse(schema, parsed)
    if (result.success) {
      return result.output
    } else {
      return []
    }
  } catch {
    return []
  }
}

function rowToUser(row: UserRow): ScimUser {
  return {
    id: row.id,
    serverId: row.serverId,
    externalId: row.externalId,
    userName: row.userName,
    displayName: row.displayName,
    name: {
      formatted: row.formattedName,
      givenName: row.givenName,
      familyName: row.familyName,
      middleName: row.middleName,
    },
    title: row.title,
    preferredLanguage: row.preferredLanguage,
    locale: row.locale,
    timezone: row.timezone,
    active: Boolean(row.active),
    emails: parseJsonColumn(row.emails, array(ScimEmailSchema)),
    phoneNumbers: parseJsonColumn(row.phoneNumbers, array(ScimPhoneNumberSchema)),
    addresses: parseJsonColumn(row.addresses, array(ScimAddressSchema)),
    groups: [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

type GroupRow = typeof scimGroup.$inferSelect

function rowToGroup(row: GroupRow): ScimGroup {
  return {
    id: row.id,
    serverId: row.serverId,
    externalId: row.externalId,
    displayName: row.displayName,
    members: [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
