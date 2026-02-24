import type { ScimAddress, ScimEmail, ScimGroup, ScimPhoneNumber, ScimUser } from '@shared/modules/scim/types'
import { eq as drizzleEq, isNotNull, type SQL, sql } from 'drizzle-orm'
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core'
import { scimGroup, scimUser } from '../../db/schema'

export const SCIM_USER_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:User'
export const SCIM_GROUP_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:Group'
export const SCIM_LIST_SCHEMA = 'urn:ietf:params:scim:api:messages:2.0:ListResponse'
export const SCIM_ERROR_SCHEMA = 'urn:ietf:params:scim:api:messages:2.0:Error'
export const SCIM_PATCH_SCHEMA = 'urn:ietf:params:scim:api:messages:2.0:PatchOp'
export const SCIM_SERVICE_PROVIDER_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'
export const SCIM_RESOURCE_TYPE_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:ResourceType'
export const SCIM_SCHEMA_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:Schema'

export function buildUserResponse(user: ScimUser, baseUrl: string): Record<string, unknown> {
  return {
    schemas: [SCIM_USER_SCHEMA],
    id: user.id,
    externalId: user.externalId ?? undefined,
    userName: user.userName,
    name: {
      formatted: user.name?.formatted ?? buildFormattedName(user.name ?? {}),
      givenName: user.name?.givenName ?? null,
      familyName: user.name?.familyName ?? null,
      middleName: user.name?.middleName ?? null,
    },
    displayName: user.displayName ?? null,
    title: user.title ?? null,
    preferredLanguage: user.preferredLanguage ?? null,
    locale: user.locale ?? null,
    timezone: user.timezone ?? null,
    active: user.active,
    emails: user.emails ?? [],
    phoneNumbers: user.phoneNumbers ?? [],
    addresses: user.addresses ?? [],
    groups: user.groups ?? [],
    meta: {
      resourceType: 'User',
      created: user.createdAt,
      lastModified: user.updatedAt,
      location: `${baseUrl}/Users/${user.id}`,
      version: `W/"${user.updatedAt}"`,
    },
  }
}

export function buildGroupResponse(group: ScimGroup, baseUrl: string): Record<string, unknown> {
  return {
    schemas: [SCIM_GROUP_SCHEMA],
    id: group.id,
    externalId: group.externalId ?? undefined,
    displayName: group.displayName,
    members: (group.members ?? []).map(member => ({
      value: member.value,
      display: member.display ?? null,
      type: 'User',
      $ref: `${baseUrl}/Users/${member.value}`,
    })),
    meta: {
      resourceType: 'Group',
      created: group.createdAt,
      lastModified: group.updatedAt,
      location: `${baseUrl}/Groups/${group.id}`,
      version: `W/"${group.updatedAt}"`,
    },
  }
}

export function buildListResponse(
  resources: Record<string, unknown>[],
  totalResults: number,
  startIndex: number,
  itemsPerPage: number,
): Record<string, unknown> {
  return {
    schemas: [SCIM_LIST_SCHEMA],
    totalResults,
    startIndex,
    itemsPerPage,
    Resources: resources,
  }
}

export function buildErrorResponse(status: number, detail: string, scimType?: string): Record<string, unknown> {
  return {
    schemas: [SCIM_ERROR_SCHEMA],
    status: String(status),
    detail,
    ...(scimType ? { scimType } : {}),
  }
}

export function buildServiceProviderConfig(baseUrl: string): Record<string, unknown> {
  return {
    schemas: [SCIM_SERVICE_PROVIDER_SCHEMA],
    documentationUri: baseUrl,
    patch: { supported: true },
    bulk: { supported: false, maxOperations: 0, maxPayloadSize: 0 },
    filter: { supported: true, maxResults: 200 },
    changePassword: { supported: false },
    sort: { supported: false },
    etag: { supported: false },
    authenticationSchemes: [],
    meta: {
      resourceType: 'ServiceProviderConfig',
      location: `${baseUrl}/ServiceProviderConfig`,
    },
  }
}

export function buildResourceTypes(baseUrl: string): Record<string, unknown> {
  return {
    schemas: [SCIM_LIST_SCHEMA],
    totalResults: 2,
    startIndex: 1,
    itemsPerPage: 2,
    Resources: [
      {
        schemas: [SCIM_RESOURCE_TYPE_SCHEMA],
        id: 'User',
        name: 'User',
        endpoint: '/Users',
        description: 'User Account',
        schema: SCIM_USER_SCHEMA,
        meta: { resourceType: 'ResourceType', location: `${baseUrl}/ResourceTypes/User` },
      },
      {
        schemas: [SCIM_RESOURCE_TYPE_SCHEMA],
        id: 'Group',
        name: 'Group',
        endpoint: '/Groups',
        description: 'Group',
        schema: SCIM_GROUP_SCHEMA,
        meta: { resourceType: 'ResourceType', location: `${baseUrl}/ResourceTypes/Group` },
      },
    ],
  }
}

export function buildSchemas(baseUrl: string): Record<string, unknown> {
  return {
    schemas: [SCIM_LIST_SCHEMA],
    totalResults: 2,
    startIndex: 1,
    itemsPerPage: 2,
    Resources: [
      {
        schemas: [SCIM_SCHEMA_SCHEMA],
        id: SCIM_USER_SCHEMA,
        name: 'User',
        description: 'User Account',
        attributes: [
          {
            name: 'userName',
            type: 'string',
            required: true,
            caseExact: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'server',
          },
          {
            name: 'name',
            type: 'complex',
            required: false,
            subAttributes: [
              { name: 'formatted', type: 'string', required: false, mutability: 'readWrite', returned: 'default' },
              { name: 'givenName', type: 'string', required: false, mutability: 'readWrite', returned: 'default' },
              { name: 'familyName', type: 'string', required: false, mutability: 'readWrite', returned: 'default' },
            ],
          },
          { name: 'displayName', type: 'string', required: false, mutability: 'readWrite', returned: 'default' },
          { name: 'active', type: 'boolean', required: false, mutability: 'readWrite', returned: 'default' },
          {
            name: 'emails',
            type: 'complex',
            multiValued: true,
            required: false,
            subAttributes: [
              { name: 'value', type: 'string', required: false, mutability: 'readWrite', returned: 'default' },
              { name: 'type', type: 'string', required: false, mutability: 'readWrite', returned: 'default' },
              { name: 'primary', type: 'boolean', required: false, mutability: 'readWrite', returned: 'default' },
            ],
          },
        ],
        meta: { resourceType: 'Schema', location: `${baseUrl}/Schemas/${SCIM_USER_SCHEMA}` },
      },
      {
        schemas: [SCIM_SCHEMA_SCHEMA],
        id: SCIM_GROUP_SCHEMA,
        name: 'Group',
        description: 'Group',
        attributes: [
          { name: 'displayName', type: 'string', required: true, mutability: 'readWrite', returned: 'default' },
          {
            name: 'members',
            type: 'complex',
            multiValued: true,
            required: false,
            subAttributes: [
              { name: 'value', type: 'string', required: false, mutability: 'immutable', returned: 'default' },
              { name: 'display', type: 'string', required: false, mutability: 'immutable', returned: 'default' },
            ],
          },
        ],
        meta: { resourceType: 'Schema', location: `${baseUrl}/Schemas/${SCIM_GROUP_SCHEMA}` },
      },
    ],
  }
}

export interface ScimFilter {
  attribute: string
  operator: string
  value: string
}

export function parseScimFilter(filter: string | null): ScimFilter | null {
  if (!filter) {
    return null
  }
  const match = filter.match(/^(\w+(?:\.\w+)*)\s+(eq|ne|co|sw|ew|pr|gt|ge|lt|le)\s+"([^"]*)"$/i)
  if (!match) {
    return null
  }
  return { attribute: match[1].toLowerCase(), operator: match[2].toLowerCase(), value: match[3] }
}

export function matchesFilter(filter: ScimFilter | null, user: ScimUser): boolean {
  if (!filter) {
    return true
  }
  const value = filter.value.toLowerCase()
  switch (filter.attribute) {
    case 'username': {
      const username = user.userName.toLowerCase()
      return applyStringOperator(username, filter.operator, value)
    }
    case 'displayname': {
      const displayName = (user.displayName ?? '').toLowerCase()
      return applyStringOperator(displayName, filter.operator, value)
    }
    case 'active': {
      const active = String(user.active).toLowerCase()
      return applyStringOperator(active, filter.operator, value)
    }
    case 'emails.value': {
      const emails = (user.emails ?? []).map(e => e.value.toLowerCase())
      return emails.some(email => applyStringOperator(email, filter.operator, value))
    }
    case 'name.givenname': {
      const givenName = (user.name?.givenName ?? '').toLowerCase()
      return applyStringOperator(givenName, filter.operator, value)
    }
    case 'name.familyname': {
      const familyName = (user.name?.familyName ?? '').toLowerCase()
      return applyStringOperator(familyName, filter.operator, value)
    }
    default:
      return true
  }
}

function applyStringOperator(target: string, operator: string, value: string): boolean {
  switch (operator) {
    case 'eq':
      return target === value
    case 'ne':
      return target !== value
    case 'co':
      return target.includes(value)
    case 'sw':
      return target.startsWith(value)
    case 'ew':
      return target.endsWith(value)
    case 'pr':
      return target.length > 0
    case 'gt':
      return target > value
    case 'ge':
      return target >= value
    case 'lt':
      return target < value
    case 'le':
      return target <= value
    default:
      return true
  }
}

export function matchesGroupFilter(filter: ScimFilter | null, group: ScimGroup): boolean {
  if (!filter) {
    return true
  }
  const value = filter.value.toLowerCase()
  switch (filter.attribute) {
    case 'displayname': {
      const displayName = group.displayName.toLowerCase()
      return applyStringOperator(displayName, filter.operator, value)
    }
    default:
      return true
  }
}

export interface PatchOperation {
  op: string
  path?: string
  value?: unknown
}

export interface PatchOp {
  schemas: string[]
  Operations: PatchOperation[]
}

export function applyPatchToUser(user: ScimUser, operations: PatchOperation[]): ScimUser {
  let result: ScimUser = { ...user }
  for (const operation of operations) {
    result = applyUserOperation(result, operation)
  }
  return result
}

function applyUserOperation(user: ScimUser, operation: PatchOperation): ScimUser {
  const op = operation.op.toLowerCase()
  const path = operation.path?.toLowerCase()
  const value = operation.value

  if (op === 'replace' || op === 'add') {
    if (!path) {
      return applyUserAttributeMap(user, value as Record<string, unknown>)
    }
    switch (path) {
      case 'username':
        return { ...user, userName: String(value) }
      case 'displayname':
        return { ...user, displayName: String(value) }
      case 'active':
        return { ...user, active: Boolean(value) }
      case 'title':
        return { ...user, title: String(value) }
      case 'preferredlanguage':
        return { ...user, preferredLanguage: String(value) }
      case 'locale':
        return { ...user, locale: String(value) }
      case 'timezone':
        return { ...user, timezone: String(value) }
      case 'name.givenname':
        return { ...user, name: { ...user.name, givenName: String(value) } }
      case 'name.familyname':
        return { ...user, name: { ...user.name, familyName: String(value) } }
      case 'name.formatted':
        return { ...user, name: { ...user.name, formatted: String(value) } }
      case 'emails':
        return { ...user, emails: value as ScimEmail[] }
      case 'phonenumbers':
        return { ...user, phoneNumbers: value as ScimPhoneNumber[] }
      case 'addresses':
        return { ...user, addresses: value as ScimAddress[] }
      default:
        return user
    }
  } else if (op === 'remove') {
    switch (path) {
      case 'displayname':
        return { ...user, displayName: null }
      case 'title':
        return { ...user, title: null }
      case 'emails':
        return { ...user, emails: [] }
      case 'phonenumbers':
        return { ...user, phoneNumbers: [] }
      case 'addresses':
        return { ...user, addresses: [] }
      default:
        return user
    }
  } else {
    return user
  }
}

function applyUserAttributeMap(user: ScimUser, attrs: Record<string, unknown>): ScimUser {
  let result = { ...user }
  for (const [key, value] of Object.entries(attrs)) {
    result = applyUserOperation(result, { op: 'replace', path: key.toLowerCase(), value })
  }
  return result
}

export type MemberPatch =
  | { kind: 'none' }
  | { kind: 'add'; ids: string[] }
  | { kind: 'remove'; ids: string[] }
  | { kind: 'replace_all'; ids: string[] }
  | { kind: 'remove_all' }

export interface GroupPatchResult {
  displayName?: string
  memberPatches: MemberPatch[]
}

export function applyPatchToGroup(operations: PatchOperation[]): GroupPatchResult {
  let displayName: string | undefined
  const memberPatches: MemberPatch[] = []

  for (const operation of operations) {
    const op = operation.op.toLowerCase()
    const path = operation.path?.toLowerCase()

    if ((op === 'replace' || op === 'add') && path === 'displayname') {
      displayName = String(operation.value)
    } else if (op === 'replace' && (!path || path === 'members')) {
      const members = (operation.value as Array<{ value: string }>) ?? []
      memberPatches.push({ kind: 'replace_all', ids: members.map(m => m.value) })
    } else if (op === 'add' && path === 'members') {
      const members = (operation.value as Array<{ value: string }>) ?? []
      memberPatches.push({ kind: 'add', ids: members.map(m => m.value) })
    } else if (op === 'remove' && path === 'members') {
      if (operation.value) {
        const members = (operation.value as Array<{ value: string }>) ?? []
        memberPatches.push({ kind: 'remove', ids: members.map(m => m.value) })
      } else {
        memberPatches.push({ kind: 'remove_all' })
      }
    }
  }

  return { displayName, memberPatches }
}

export function buildFormattedName(name: {
  givenName?: string | null
  middleName?: string | null
  familyName?: string | null
}): string | null {
  const parts = [name.givenName, name.middleName, name.familyName].filter(p => p?.trim())
  return parts.length > 0 ? parts.join(' ') : null
}

export function getScimBaseUrl(requestUrl: URL, serverId: string): string {
  return `${requestUrl.origin}/scim/${serverId}/v2`
}

export function parseStartIndex(value: string | null): number {
  const parsed = Number(value)
  return parsed >= 1 ? Math.floor(parsed) : 1
}

export function parseCount(value: string | null): number {
  const parsed = Number(value)
  return parsed >= 1 ? Math.min(Math.floor(parsed), 200) : 100
}

export interface SqlFilter {
  where: SQL | undefined
  requiresInMemoryFilter: boolean
}

export function buildUserSqlFilter(serverId: string, filter: ScimFilter | null): SqlFilter {
  if (!filter) {
    return { where: drizzleEq(scimUser.serverId, serverId), requiresInMemoryFilter: false }
  }

  const column = resolveUserColumn(filter.attribute)
  if (!column) {
    return { where: drizzleEq(scimUser.serverId, serverId), requiresInMemoryFilter: true }
  }

  const condition = buildSqlCondition(column, filter.operator, filter.value, filter.attribute)
  if (!condition) {
    return { where: drizzleEq(scimUser.serverId, serverId), requiresInMemoryFilter: false }
  }

  return {
    where: sql`${drizzleEq(scimUser.serverId, serverId)} AND ${condition}`,
    requiresInMemoryFilter: false,
  }
}

export function buildGroupSqlFilter(serverId: string, filter: ScimFilter | null): SqlFilter {
  if (!filter) {
    return { where: drizzleEq(scimGroup.serverId, serverId), requiresInMemoryFilter: false }
  }

  const column = resolveGroupColumn(filter.attribute)
  if (!column) {
    return { where: drizzleEq(scimGroup.serverId, serverId), requiresInMemoryFilter: true }
  }

  const condition = buildSqlCondition(column, filter.operator, filter.value, filter.attribute)
  if (!condition) {
    return { where: drizzleEq(scimGroup.serverId, serverId), requiresInMemoryFilter: false }
  }

  return {
    where: sql`${drizzleEq(scimGroup.serverId, serverId)} AND ${condition}`,
    requiresInMemoryFilter: false,
  }
}

function resolveUserColumn(attribute: string): SQLiteColumn | null {
  switch (attribute) {
    case 'username':
      return scimUser.userName
    case 'displayname':
      return scimUser.displayName
    case 'active':
      return scimUser.active
    case 'name.givenname':
      return scimUser.givenName
    case 'name.familyname':
      return scimUser.familyName
    default:
      return null
  }
}

function resolveGroupColumn(attribute: string): SQLiteColumn | null {
  switch (attribute) {
    case 'displayname':
      return scimGroup.displayName
    default:
      return null
  }
}

function buildSqlCondition(column: SQLiteColumn, operator: string, value: string, attribute: string): SQL | null {
  if (attribute === 'active') {
    return buildActiveSqlCondition(column, operator, value)
  }

  const lowerValue = value.toLowerCase()
  const lowerColumn = sql`lower(${column})`

  switch (operator) {
    case 'eq':
      return sql`${lowerColumn} = ${lowerValue}`
    case 'ne':
      return sql`${lowerColumn} != ${lowerValue}`
    case 'co':
      return sql`${lowerColumn} LIKE ${`%${lowerValue}%`}`
    case 'sw':
      return sql`${lowerColumn} LIKE ${`${lowerValue}%`}`
    case 'ew':
      return sql`${lowerColumn} LIKE ${`%${lowerValue}`}`
    case 'pr':
      return sql`${isNotNull(column)} AND ${column} != ''`
    case 'gt':
      return sql`${lowerColumn} > ${lowerValue}`
    case 'ge':
      return sql`${lowerColumn} >= ${lowerValue}`
    case 'lt':
      return sql`${lowerColumn} < ${lowerValue}`
    case 'le':
      return sql`${lowerColumn} <= ${lowerValue}`
    default:
      return null
  }
}

function buildActiveSqlCondition(column: SQLiteColumn, operator: string, value: string): SQL | null {
  const boolValue = value.toLowerCase() === 'true' ? 1 : 0

  switch (operator) {
    case 'eq':
      return sql`${column} = ${boolValue}`
    case 'ne':
      return sql`${column} != ${boolValue}`
    default:
      return null
  }
}

export function buildScimResponse(payload: unknown, status = 200): Response {
  return Response.json(payload, {
    status,
    headers: {
      'Content-Type': 'application/scim+json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export function allowResponse(payload: unknown, status = 200): Response {
  return Response.json(payload, {
    status,
    headers: { 'Access-Control-Allow-Origin': '*' },
  })
}
