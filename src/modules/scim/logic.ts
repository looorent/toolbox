import type {
  CreateGroupInput,
  CreateServerInput,
  CreateUserInput,
  ScimGroup,
  ScimGroupsPage,
  ScimUser,
  ScimUsersPage,
  ServerWithCounts,
  UpdateGroupInput,
  UpdateUserInput,
} from './types'

export async function createServer(input: CreateServerInput): Promise<ServerWithCounts> {
  const response = await fetch('/api/scim-servers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`Failed to create SCIM server: ${response.status}`)
  }
  return response.json() as Promise<ServerWithCounts>
}

export async function fetchServer(id: string): Promise<ServerWithCounts> {
  const response = await fetch(`/api/scim-servers/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch SCIM server: ${response.status}`)
  }
  return response.json() as Promise<ServerWithCounts>
}

export async function deleteServer(id: string): Promise<void> {
  const response = await fetch(`/api/scim-servers/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Failed to delete SCIM server: ${response.status}`)
  }
}

export async function fetchUsers(serverId: string): Promise<ScimUsersPage> {
  const response = await fetch(`/api/scim-servers/${serverId}/users`)
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`)
  }
  return response.json() as Promise<ScimUsersPage>
}

export async function createUser(serverId: string, input: CreateUserInput): Promise<ScimUser> {
  const response = await fetch(`/api/scim-servers/${serverId}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.status}`)
  }
  return response.json() as Promise<ScimUser>
}

export async function updateUser(serverId: string, userId: string, input: UpdateUserInput): Promise<ScimUser> {
  const response = await fetch(`/api/scim-servers/${serverId}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.status}`)
  }
  return response.json() as Promise<ScimUser>
}

export async function deleteUser(serverId: string, userId: string): Promise<void> {
  const response = await fetch(`/api/scim-servers/${serverId}/users/${userId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.status}`)
  }
}

export async function fetchGroups(serverId: string): Promise<ScimGroupsPage> {
  const response = await fetch(`/api/scim-servers/${serverId}/groups`)
  if (!response.ok) {
    throw new Error(`Failed to fetch groups: ${response.status}`)
  }
  return response.json() as Promise<ScimGroupsPage>
}

export async function createGroup(serverId: string, input: CreateGroupInput): Promise<ScimGroup> {
  const response = await fetch(`/api/scim-servers/${serverId}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`Failed to create group: ${response.status}`)
  }
  return response.json() as Promise<ScimGroup>
}

export async function updateGroup(serverId: string, groupId: string, input: UpdateGroupInput): Promise<ScimGroup> {
  const response = await fetch(`/api/scim-servers/${serverId}/groups/${groupId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`Failed to update group: ${response.status}`)
  }
  return response.json() as Promise<ScimGroup>
}

export async function deleteGroup(serverId: string, groupId: string): Promise<void> {
  const response = await fetch(`/api/scim-servers/${serverId}/groups/${groupId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Failed to delete group: ${response.status}`)
  }
}

export function getScimBaseUrl(serverId: string): string {
  return `${window.location.origin}/scim/${serverId}/v2`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
}

export function getUserPrimaryEmail(user: ScimUser): string {
  const primary = user.emails?.find(e => e.primary)
  const first = user.emails?.[0]
  return primary?.value ?? first?.value ?? ''
}

export function getUserDisplayName(user: ScimUser): string {
  return user.displayName || user.name?.formatted || `${user.name?.givenName ?? ''} ${user.name?.familyName ?? ''}`.trim() || user.userName
}
