import type { ScimGroup, ScimServer, ScimUser } from '@shared/modules/scim/types'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { SCIM_PATCH_SCHEMA } from './logic'
import { createRepository } from './repository'
import {
  scimCountResources,
  scimCreateGroup,
  scimCreateUser,
  scimDeleteGroup,
  scimDeleteUser,
  scimGetUser,
  scimListUsers,
  scimPatchUser,
  scimServiceProviderConfig,
} from './scim-api'

vi.mock('./repository', () => ({
  createRepository: vi.fn(),
}))

// crypto.subtle.timingSafeEqual is a Cloudflare Workers API not available in Node
beforeAll(() => {
  if (!crypto.subtle.timingSafeEqual) {
    Object.defineProperty(crypto.subtle, 'timingSafeEqual', {
      value: (a: ArrayBuffer, b: ArrayBuffer) => {
        const viewA = new Uint8Array(a)
        const viewB = new Uint8Array(b)
        if (viewA.length !== viewB.length) {
          return false
        }
        let result = 0
        for (let i = 0; i < viewA.length; i++) {
          result |= viewA[i] ^ viewB[i]
        }
        return result === 0
      },
    })
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

function mockEnv(): Env {
  return { DB: {} } as unknown as Env
}

function mockCtx(): ExecutionContext {
  return { waitUntil: vi.fn() } as unknown as ExecutionContext
}

function makeJsonRequest(url: string, body: unknown, token?: string): Request {
  const json = JSON.stringify(body)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Content-Length': String(json.length),
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return new Request(url, { method: 'POST', headers, body: json })
}

function makeGetRequest(url: string, token?: string): Request {
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return new Request(url, { method: 'GET', headers })
}

function makeDeleteRequest(url: string, token?: string): Request {
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return new Request(url, { method: 'DELETE', headers })
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
  name: { givenName: 'Jane', familyName: 'Doe', formatted: 'Jane Doe' },
  active: true,
  emails: [],
  phoneNumbers: [],
  addresses: [],
  groups: [],
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

const BEARER_TOKEN = 'test-token-abc-123'

function mockRepo(overrides: Record<string, unknown> = {}) {
  const repo = {
    findServer: vi.fn().mockResolvedValue(SERVER),
    findServerBearerToken: vi.fn().mockResolvedValue(BEARER_TOKEN),
    touchServerLastUsed: vi.fn().mockResolvedValue(undefined),
    createServer: vi.fn().mockImplementation(async (server: ScimServer) => server),
    deleteServer: vi.fn().mockResolvedValue(undefined),
    listUsers: vi.fn().mockResolvedValue([]),
    listUsersPaginated: vi.fn().mockResolvedValue([]),
    countUsers: vi.fn().mockResolvedValue(0),
    countUsersFiltered: vi.fn().mockResolvedValue(0),
    countGroups: vi.fn().mockResolvedValue(0),
    countGroupsFiltered: vi.fn().mockResolvedValue(0),
    findUser: vi.fn().mockResolvedValue(null),
    createUser: vi.fn().mockImplementation(async (user: ScimUser) => user),
    updateUser: vi.fn().mockImplementation(async (user: ScimUser) => user),
    deleteUser: vi.fn().mockResolvedValue(undefined),
    listGroups: vi.fn().mockResolvedValue([]),
    listGroupsPaginated: vi.fn().mockResolvedValue([]),
    findGroup: vi.fn().mockResolvedValue(null),
    createGroup: vi.fn().mockImplementation(async (group: ScimGroup) => group),
    updateGroup: vi.fn().mockImplementation(async (group: ScimGroup) => group),
    deleteGroup: vi.fn().mockResolvedValue(undefined),
    addGroupMembers: vi.fn().mockResolvedValue(undefined),
    removeGroupMembers: vi.fn().mockResolvedValue(undefined),
    replaceGroupMembers: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
  vi.mocked(createRepository).mockReturnValue(repo as unknown as ReturnType<typeof createRepository>)
  return repo
}

const BASE_URL = 'https://example.com/scim/srv-1/v2'

describe('bearer auth', () => {
  it('allows request with valid token', async () => {
    mockRepo({ countUsersFiltered: vi.fn().mockResolvedValue(0), listUsersPaginated: vi.fn().mockResolvedValue([]) })
    const request = makeGetRequest(`${BASE_URL}/Users`, BEARER_TOKEN)
    const url = new URL(request.url)

    const response = await scimListUsers(request, mockEnv(), mockCtx(), 'srv-1', url)

    expect(response.status).toBe(200)
  })

  it('returns 401 when Authorization header is missing', async () => {
    mockRepo()
    const request = makeGetRequest(`${BASE_URL}/Users`)
    const url = new URL(request.url)

    const response = await scimListUsers(request, mockEnv(), mockCtx(), 'srv-1', url)

    expect(response.status).toBe(401)
  })

  it('returns 401 when token is wrong', async () => {
    mockRepo()
    const request = makeGetRequest(`${BASE_URL}/Users`, 'wrong-token')
    const url = new URL(request.url)

    const response = await scimListUsers(request, mockEnv(), mockCtx(), 'srv-1', url)

    expect(response.status).toBe(401)
  })

  it('allows unauthenticated access when server has no stored token', async () => {
    mockRepo({
      findServerBearerToken: vi.fn().mockResolvedValue(null),
      countUsersFiltered: vi.fn().mockResolvedValue(0),
      listUsersPaginated: vi.fn().mockResolvedValue([]),
    })
    const request = makeGetRequest(`${BASE_URL}/Users`)
    const url = new URL(request.url)

    const response = await scimListUsers(request, mockEnv(), mockCtx(), 'srv-1', url)

    expect(response.status).toBe(200)
  })
})

describe('body limits', () => {
  it('returns 413 when Content-Length exceeds 1 MB', async () => {
    mockRepo()
    const request = new Request(`${BASE_URL}/Users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '2000000',
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      body: '{}',
    })
    const url = new URL(request.url)

    const response = await scimCreateUser(request, mockEnv(), mockCtx(), 'srv-1', url)

    expect(response.status).toBe(413)
  })

  it('returns 400 for invalid JSON', async () => {
    mockRepo()
    const request = new Request(`${BASE_URL}/Users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '5',
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      body: '{bad}',
    })
    const url = new URL(request.url)

    const response = await scimCreateUser(request, mockEnv(), mockCtx(), 'srv-1', url)

    expect(response.status).toBe(400)
  })
})

describe('scimCreateUser', () => {
  it('returns 201 with SCIM response containing schemas and meta', async () => {
    mockRepo()
    const request = makeJsonRequest(`${BASE_URL}/Users`, { userName: 'jdoe', displayName: 'Jane Doe' }, BEARER_TOKEN)
    const url = new URL(request.url)

    const response = await scimCreateUser(request, mockEnv(), mockCtx(), 'srv-1', url)

    expect(response.status).toBe(201)
    const body = (await response.json()) as Record<string, unknown>
    expect(body.schemas).toBeDefined()
    expect(body.meta).toBeDefined()
    expect(body.userName).toBe('jdoe')
  })

  it('rejects missing userName with 400', async () => {
    mockRepo()
    const request = makeJsonRequest(`${BASE_URL}/Users`, { displayName: 'No Username' }, BEARER_TOKEN)
    const url = new URL(request.url)

    const response = await scimCreateUser(request, mockEnv(), mockCtx(), 'srv-1', url)

    expect(response.status).toBe(400)
  })

  it('returns 409 on uniqueness constraint violation', async () => {
    mockRepo({
      createUser: vi.fn().mockRejectedValue(new Error('UNIQUE constraint failed: scim_user.userName')),
    })
    const request = makeJsonRequest(`${BASE_URL}/Users`, { userName: 'duplicate' }, BEARER_TOKEN)
    const url = new URL(request.url)

    const response = await scimCreateUser(request, mockEnv(), mockCtx(), 'srv-1', url)

    expect(response.status).toBe(409)
  })
})

describe('scimGetUser', () => {
  it('returns user with SCIM envelope', async () => {
    mockRepo({ findUser: vi.fn().mockResolvedValue(USER) })
    const request = makeGetRequest(`${BASE_URL}/Users/usr-1`, BEARER_TOKEN)
    const url = new URL(request.url)

    const response = await scimGetUser(request, mockEnv(), mockCtx(), 'srv-1', 'usr-1', url)

    expect(response.status).toBe(200)
    const body = (await response.json()) as Record<string, unknown>
    expect(body.userName).toBe('jdoe')
    expect(body.schemas).toBeDefined()
  })

  it('returns 404 for missing user', async () => {
    mockRepo()
    const request = makeGetRequest(`${BASE_URL}/Users/nonexistent`, BEARER_TOKEN)
    const url = new URL(request.url)

    const response = await scimGetUser(request, mockEnv(), mockCtx(), 'srv-1', 'nonexistent', url)

    expect(response.status).toBe(404)
  })
})

describe('scimPatchUser', () => {
  it('applies patch operations and returns updated user', async () => {
    mockRepo({
      findUser: vi.fn().mockResolvedValue(USER),
      updateUser: vi.fn().mockImplementation(async (user: ScimUser) => user),
    })
    const patchBody = {
      schemas: [SCIM_PATCH_SCHEMA],
      Operations: [{ op: 'replace', path: 'active', value: false }],
    }
    const request = makeJsonRequest(`${BASE_URL}/Users/usr-1`, patchBody, BEARER_TOKEN)
    const url = new URL(request.url)

    const response = await scimPatchUser(request, mockEnv(), mockCtx(), 'srv-1', 'usr-1', url)

    expect(response.status).toBe(200)
  })

  it('rejects missing PatchOp schema URN with 400', async () => {
    mockRepo({ findUser: vi.fn().mockResolvedValue(USER) })
    const patchBody = {
      schemas: ['urn:wrong:schema'],
      Operations: [{ op: 'replace', path: 'active', value: false }],
    }
    const request = makeJsonRequest(`${BASE_URL}/Users/usr-1`, patchBody, BEARER_TOKEN)
    const url = new URL(request.url)

    const response = await scimPatchUser(request, mockEnv(), mockCtx(), 'srv-1', 'usr-1', url)

    expect(response.status).toBe(400)
  })
})

describe('scimDeleteUser', () => {
  it('returns 204 with no body', async () => {
    mockRepo({ findUser: vi.fn().mockResolvedValue(USER) })
    const request = makeDeleteRequest(`${BASE_URL}/Users/usr-1`, BEARER_TOKEN)

    const response = await scimDeleteUser(request, mockEnv(), mockCtx(), 'srv-1', 'usr-1')

    expect(response.status).toBe(204)
    expect(response.body).toBeNull()
  })

  it('returns 404 for missing user', async () => {
    mockRepo()
    const request = makeDeleteRequest(`${BASE_URL}/Users/nonexistent`, BEARER_TOKEN)

    const response = await scimDeleteUser(request, mockEnv(), mockCtx(), 'srv-1', 'nonexistent')

    expect(response.status).toBe(404)
  })
})

describe('scimListUsers', () => {
  it('returns ListResponse envelope with totalResults and startIndex', async () => {
    mockRepo({
      countUsersFiltered: vi.fn().mockResolvedValue(1),
      listUsersPaginated: vi.fn().mockResolvedValue([USER]),
    })
    const request = makeGetRequest(`${BASE_URL}/Users`, BEARER_TOKEN)
    const url = new URL(request.url)

    const response = await scimListUsers(request, mockEnv(), mockCtx(), 'srv-1', url)

    expect(response.status).toBe(200)
    const body = (await response.json()) as Record<string, unknown>
    expect(body.totalResults).toBe(1)
    expect(body.startIndex).toBe(1)
    expect(body.schemas).toBeDefined()
    expect(Array.isArray(body.Resources)).toBe(true)
  })
})

describe('scimCreateGroup', () => {
  it('returns 201 with SCIM group response', async () => {
    mockRepo({
      createGroup: vi.fn().mockImplementation(async (group: ScimGroup) => group),
      findGroup: vi.fn().mockResolvedValue(GROUP),
    })
    const request = makeJsonRequest(`${BASE_URL}/Groups`, { displayName: 'Engineers' }, BEARER_TOKEN)
    const url = new URL(request.url)

    const response = await scimCreateGroup(request, mockEnv(), mockCtx(), 'srv-1', url)

    expect(response.status).toBe(201)
    const body = (await response.json()) as Record<string, unknown>
    expect(body.displayName).toBe('Engineers')
    expect(body.schemas).toBeDefined()
  })

  it('rejects missing displayName with 400', async () => {
    mockRepo()
    const request = makeJsonRequest(`${BASE_URL}/Groups`, { displayName: '  ' }, BEARER_TOKEN)
    const url = new URL(request.url)

    const response = await scimCreateGroup(request, mockEnv(), mockCtx(), 'srv-1', url)

    expect(response.status).toBe(400)
  })
})

describe('scimDeleteGroup', () => {
  it('returns 204 with no body', async () => {
    mockRepo({ findGroup: vi.fn().mockResolvedValue(GROUP) })
    const request = makeDeleteRequest(`${BASE_URL}/Groups/grp-1`, BEARER_TOKEN)

    const response = await scimDeleteGroup(request, mockEnv(), mockCtx(), 'srv-1', 'grp-1')

    expect(response.status).toBe(204)
    expect(response.body).toBeNull()
  })

  it('returns 404 for missing group', async () => {
    mockRepo()
    const request = makeDeleteRequest(`${BASE_URL}/Groups/nonexistent`, BEARER_TOKEN)

    const response = await scimDeleteGroup(request, mockEnv(), mockCtx(), 'srv-1', 'nonexistent')

    expect(response.status).toBe(404)
  })
})

describe('scimServiceProviderConfig', () => {
  it('returns config with correct schemas', async () => {
    mockRepo()
    const request = makeGetRequest(`${BASE_URL}/ServiceProviderConfig`, BEARER_TOKEN)
    const url = new URL(request.url)

    const response = await scimServiceProviderConfig(request, mockEnv(), mockCtx(), 'srv-1', url)

    expect(response.status).toBe(200)
    const body = (await response.json()) as Record<string, unknown>
    expect(body.schemas).toBeDefined()
    expect(Array.isArray(body.schemas)).toBe(true)
  })
})

describe('scimCountResources', () => {
  it('returns user and group counts', async () => {
    mockRepo({
      countUsers: vi.fn().mockResolvedValue(10),
      countGroups: vi.fn().mockResolvedValue(3),
    })
    const request = makeGetRequest(`${BASE_URL}/count`, BEARER_TOKEN)

    const response = await scimCountResources(request, mockEnv(), mockCtx(), 'srv-1')

    expect(response.status).toBe(200)
    const body = (await response.json()) as { userCount: number; groupCount: number }
    expect(body.userCount).toBe(10)
    expect(body.groupCount).toBe(3)
  })
})
