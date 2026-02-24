import type { ScimGroup, ScimServer, ScimUser } from '@shared/modules/scim/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  apiCreateGroup,
  apiCreateServer,
  apiCreateUser,
  apiDeleteGroup,
  apiDeleteServer,
  apiDeleteUser,
  apiGetServer,
  apiListGroups,
  apiListUsers,
} from './handlers'
import { createRepository } from './repository'

vi.mock('./repository', () => ({
  createRepository: vi.fn(),
}))

afterEach(() => {
  vi.clearAllMocks()
})

function mockEnv(): Env {
  return { DB: {} } as unknown as Env
}

function makeJsonRequest(url: string, body: unknown): Request {
  const json = JSON.stringify(body)
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': String(json.length) },
    body: json,
  })
}

function makeLargeRequest(url: string): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': '2000000' },
    body: '{}',
  })
}

const SERVER: ScimServer = {
  id: 'srv-1',
  name: 'Test Server',
  createdAt: '2024-01-01T00:00:00.000Z',
}

const USER: ScimUser = {
  id: 'usr-1',
  serverId: 'srv-1',
  userName: 'jdoe',
  displayName: 'Jane Doe',
  active: true,
  emails: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

const GROUP: ScimGroup = {
  id: 'grp-1',
  serverId: 'srv-1',
  displayName: 'Engineers',
  members: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

function mockRepo(overrides: Record<string, unknown> = {}) {
  const repo = {
    findServer: vi.fn().mockResolvedValue(null),
    createServer: vi.fn().mockImplementation(async (server: ScimServer) => server),
    deleteServer: vi.fn().mockResolvedValue(undefined),
    listUsers: vi.fn().mockResolvedValue([]),
    countUsers: vi.fn().mockResolvedValue(0),
    countGroups: vi.fn().mockResolvedValue(0),
    findUser: vi.fn().mockResolvedValue(null),
    createUser: vi.fn().mockImplementation(async (user: ScimUser) => user),
    deleteUser: vi.fn().mockResolvedValue(undefined),
    listGroups: vi.fn().mockResolvedValue([]),
    findGroup: vi.fn().mockResolvedValue(null),
    createGroup: vi.fn().mockImplementation(async (group: ScimGroup) => group),
    deleteGroup: vi.fn().mockResolvedValue(undefined),
    addGroupMembers: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
  vi.mocked(createRepository).mockReturnValue(repo as unknown as ReturnType<typeof createRepository>)
  return repo
}

describe('apiCreateServer', () => {
  it('returns 201 with bearerToken in response', async () => {
    mockRepo()
    const request = makeJsonRequest('https://example.com/api/scim-servers', { name: 'My Server' })

    const response = await apiCreateServer(request, mockEnv())

    expect(response.status).toBe(201)
    const body = (await response.json()) as ScimServer
    expect(body.name).toBe('My Server')
    expect(body.bearerToken).toBeDefined()
  })

  it('rejects empty name with 400', async () => {
    mockRepo()
    const request = makeJsonRequest('https://example.com/api/scim-servers', { name: '   ' })

    const response = await apiCreateServer(request, mockEnv())

    expect(response.status).toBe(400)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('name_required')
  })

  it('rejects invalid JSON with 400', async () => {
    mockRepo()
    const request = new Request('https://example.com/api/scim-servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': '5' },
      body: '{bad}',
    })

    const response = await apiCreateServer(request, mockEnv())

    expect(response.status).toBe(400)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('invalid_json')
  })

  it('rejects oversized body with 413', async () => {
    mockRepo()
    const request = makeLargeRequest('https://example.com/api/scim-servers')

    const response = await apiCreateServer(request, mockEnv())

    expect(response.status).toBe(413)
  })

  it('calls prepopulate when flag is set', async () => {
    const repo = mockRepo()
    repo.createUser.mockImplementation(async (user: ScimUser) => user)
    repo.createGroup.mockImplementation(async (group: ScimGroup) => group)
    const request = makeJsonRequest('https://example.com/api/scim-servers', { name: 'Prepop', prepopulate: true })

    const response = await apiCreateServer(request, mockEnv())

    expect(response.status).toBe(201)
    expect(repo.createUser).toHaveBeenCalled()
    expect(repo.createGroup).toHaveBeenCalled()
  })
})

describe('apiGetServer', () => {
  it('returns server with user and group counts', async () => {
    mockRepo({
      findServer: vi.fn().mockResolvedValue(SERVER),
      countUsers: vi.fn().mockResolvedValue(5),
      countGroups: vi.fn().mockResolvedValue(2),
    })

    const response = await apiGetServer(mockEnv(), 'srv-1')

    expect(response.status).toBe(200)
    const body = (await response.json()) as ScimServer & { userCount: number; groupCount: number }
    expect(body.name).toBe('Test Server')
    expect(body.userCount).toBe(5)
    expect(body.groupCount).toBe(2)
  })

  it('returns 404 for unknown server', async () => {
    mockRepo()

    const response = await apiGetServer(mockEnv(), 'nonexistent')

    expect(response.status).toBe(404)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('server_not_found')
  })
})

describe('apiDeleteServer', () => {
  it('returns { deleted: true }', async () => {
    const repo = mockRepo({ findServer: vi.fn().mockResolvedValue(SERVER) })

    const response = await apiDeleteServer(mockEnv(), 'srv-1')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ deleted: true })
    expect(repo.deleteServer).toHaveBeenCalledWith('srv-1')
  })

  it('returns 404 for unknown server', async () => {
    mockRepo()

    const response = await apiDeleteServer(mockEnv(), 'nonexistent')

    expect(response.status).toBe(404)
  })
})

describe('apiListUsers', () => {
  it('returns users and total', async () => {
    mockRepo({
      findServer: vi.fn().mockResolvedValue(SERVER),
      listUsers: vi.fn().mockResolvedValue([USER]),
    })

    const response = await apiListUsers(mockEnv(), 'srv-1')

    expect(response.status).toBe(200)
    const body = (await response.json()) as { users: ScimUser[]; total: number }
    expect(body.users).toHaveLength(1)
    expect(body.total).toBe(1)
  })

  it('returns 404 for unknown server', async () => {
    mockRepo()

    const response = await apiListUsers(mockEnv(), 'nonexistent')

    expect(response.status).toBe(404)
  })
})

describe('apiCreateUser', () => {
  it('returns 201 with user', async () => {
    mockRepo({ findServer: vi.fn().mockResolvedValue(SERVER) })
    const request = makeJsonRequest('https://example.com/api/scim-servers/srv-1/users', { userName: 'jdoe' })

    const response = await apiCreateUser(request, mockEnv(), 'srv-1')

    expect(response.status).toBe(201)
    const body = (await response.json()) as ScimUser
    expect(body.userName).toBe('jdoe')
  })

  it('rejects empty userName with 400', async () => {
    mockRepo({ findServer: vi.fn().mockResolvedValue(SERVER) })
    const request = makeJsonRequest('https://example.com/api/scim-servers/srv-1/users', { userName: '  ' })

    const response = await apiCreateUser(request, mockEnv(), 'srv-1')

    expect(response.status).toBe(400)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('userName_required')
  })
})

describe('apiDeleteUser', () => {
  it('returns { deleted: true }', async () => {
    mockRepo({
      findServer: vi.fn().mockResolvedValue(SERVER),
      findUser: vi.fn().mockResolvedValue(USER),
    })

    const response = await apiDeleteUser(mockEnv(), 'srv-1', 'usr-1')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ deleted: true })
  })

  it('returns 404 for unknown user', async () => {
    mockRepo({ findServer: vi.fn().mockResolvedValue(SERVER) })

    const response = await apiDeleteUser(mockEnv(), 'srv-1', 'nonexistent')

    expect(response.status).toBe(404)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('user_not_found')
  })
})

describe('apiListGroups', () => {
  it('returns groups and total', async () => {
    mockRepo({
      findServer: vi.fn().mockResolvedValue(SERVER),
      listGroups: vi.fn().mockResolvedValue([GROUP]),
    })

    const response = await apiListGroups(mockEnv(), 'srv-1')

    expect(response.status).toBe(200)
    const body = (await response.json()) as { groups: ScimGroup[]; total: number }
    expect(body.groups).toHaveLength(1)
    expect(body.total).toBe(1)
  })
})

describe('apiCreateGroup', () => {
  it('returns 201 with group', async () => {
    mockRepo({ findServer: vi.fn().mockResolvedValue(SERVER) })
    const request = makeJsonRequest('https://example.com/api/scim-servers/srv-1/groups', { displayName: 'Engineers' })

    const response = await apiCreateGroup(request, mockEnv(), 'srv-1')

    expect(response.status).toBe(201)
    const body = (await response.json()) as ScimGroup
    expect(body.displayName).toBe('Engineers')
  })

  it('rejects empty displayName with 400', async () => {
    mockRepo({ findServer: vi.fn().mockResolvedValue(SERVER) })
    const request = makeJsonRequest('https://example.com/api/scim-servers/srv-1/groups', { displayName: '  ' })

    const response = await apiCreateGroup(request, mockEnv(), 'srv-1')

    expect(response.status).toBe(400)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('displayName_required')
  })
})

describe('apiDeleteGroup', () => {
  it('returns { deleted: true }', async () => {
    mockRepo({
      findServer: vi.fn().mockResolvedValue(SERVER),
      findGroup: vi.fn().mockResolvedValue(GROUP),
    })

    const response = await apiDeleteGroup(mockEnv(), 'srv-1', 'grp-1')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ deleted: true })
  })

  it('returns 404 for unknown group', async () => {
    mockRepo({ findServer: vi.fn().mockResolvedValue(SERVER) })

    const response = await apiDeleteGroup(mockEnv(), 'srv-1', 'nonexistent')

    expect(response.status).toBe(404)
    const body = (await response.json()) as { error: string }
    expect(body.error).toBe('group_not_found')
  })
})
