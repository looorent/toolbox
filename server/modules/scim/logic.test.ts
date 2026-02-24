import type { ScimGroup, ScimUser } from '@shared/modules/scim/types'
import { describe, expect, it } from 'vitest'
import {
  applyPatchToGroup,
  applyPatchToUser,
  buildErrorResponse,
  buildFormattedName,
  buildGroupResponse,
  buildListResponse,
  buildUserResponse,
  getScimBaseUrl,
  matchesFilter,
  matchesGroupFilter,
  parseCount,
  parseScimFilter,
  parseStartIndex,
  SCIM_ERROR_SCHEMA,
  SCIM_GROUP_SCHEMA,
  SCIM_LIST_SCHEMA,
  SCIM_USER_SCHEMA,
} from './logic'

function makeUser(overrides: Partial<ScimUser> = {}): ScimUser {
  return {
    id: 'user-1',
    serverId: 'server-1',
    userName: 'alice.johnson',
    displayName: 'Alice Johnson',
    name: { givenName: 'Alice', familyName: 'Johnson', formatted: 'Alice Johnson' },
    title: 'Engineer',
    active: true,
    emails: [{ value: 'alice@example.com', type: 'work', primary: true }],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeGroup(overrides: Partial<ScimGroup> = {}): ScimGroup {
  return {
    id: 'group-1',
    serverId: 'server-1',
    displayName: 'Engineering',
    members: [{ value: 'user-1', display: 'Alice Johnson' }],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const BASE_URL = 'https://example.com/scim/server-1/v2'

describe('buildUserResponse', () => {
  it('sets the correct schema', () => {
    const result = buildUserResponse(makeUser(), BASE_URL)
    expect(result.schemas).toEqual([SCIM_USER_SCHEMA])
  })

  it('includes meta with resourceType and location', () => {
    const user = makeUser()
    const result = buildUserResponse(user, BASE_URL)
    const meta = result.meta as Record<string, unknown>
    expect(meta.resourceType).toBe('User')
    expect(meta.location).toBe(`${BASE_URL}/Users/user-1`)
  })

  it('maps userName and displayName', () => {
    const result = buildUserResponse(makeUser({ userName: 'bob', displayName: 'Bob Smith' }), BASE_URL)
    expect(result.userName).toBe('bob')
    expect(result.displayName).toBe('Bob Smith')
  })

  it('includes emails array', () => {
    const user = makeUser({ emails: [{ value: 'alice@example.com', primary: true }] })
    const result = buildUserResponse(user, BASE_URL)
    expect(result.emails).toEqual([{ value: 'alice@example.com', primary: true }])
  })

  it('uses empty arrays for missing multi-value attributes', () => {
    const user = makeUser({ emails: undefined, phoneNumbers: undefined })
    const result = buildUserResponse(user, BASE_URL)
    expect(result.emails).toEqual([])
    expect(result.phoneNumbers).toEqual([])
  })
})

describe('buildGroupResponse', () => {
  it('sets the correct schema', () => {
    const result = buildGroupResponse(makeGroup(), BASE_URL)
    expect(result.schemas).toEqual([SCIM_GROUP_SCHEMA])
  })

  it('includes meta with resourceType and location', () => {
    const group = makeGroup()
    const result = buildGroupResponse(group, BASE_URL)
    const meta = result.meta as Record<string, unknown>
    expect(meta.resourceType).toBe('Group')
    expect(meta.location).toBe(`${BASE_URL}/Groups/group-1`)
  })

  it('includes enriched members with $ref links', () => {
    const group = makeGroup({ members: [{ value: 'user-1', display: 'Alice' }] })
    const result = buildGroupResponse(group, BASE_URL)
    const members = result.members as Array<Record<string, unknown>>
    expect(members[0]).toMatchObject({
      value: 'user-1',
      display: 'Alice',
      $ref: `${BASE_URL}/Users/user-1`,
    })
  })
})

describe('buildListResponse', () => {
  it('includes the ListResponse schema', () => {
    const result = buildListResponse([], 0, 1, 100)
    expect(result.schemas).toEqual([SCIM_LIST_SCHEMA])
  })

  it('sets totalResults, startIndex and itemsPerPage', () => {
    const result = buildListResponse([], 42, 5, 10)
    expect(result.totalResults).toBe(42)
    expect(result.startIndex).toBe(5)
    expect(result.itemsPerPage).toBe(10)
  })

  it('places resources in the Resources key', () => {
    const resources = [{ id: 'a' }, { id: 'b' }]
    const result = buildListResponse(resources, 2, 1, 100)
    expect(result.Resources).toEqual(resources)
  })
})

describe('buildErrorResponse', () => {
  it('includes the Error schema', () => {
    const result = buildErrorResponse(404, 'Not found.')
    expect(result.schemas).toEqual([SCIM_ERROR_SCHEMA])
  })

  it('serialises status as a string', () => {
    const result = buildErrorResponse(400, 'Bad request.')
    expect(result.status).toBe('400')
  })

  it('includes detail', () => {
    const result = buildErrorResponse(404, 'User not found.', 'noTarget')
    expect(result.detail).toBe('User not found.')
    expect(result.scimType).toBe('noTarget')
  })

  it('omits scimType when not provided', () => {
    const result = buildErrorResponse(500, 'Internal error.')
    expect(result).not.toHaveProperty('scimType')
  })
})

describe('parseScimFilter', () => {
  it('returns null for null input', () => {
    expect(parseScimFilter(null)).toBeNull()
  })

  it('parses a simple eq filter', () => {
    const result = parseScimFilter('userName eq "alice"')
    expect(result).toEqual({ attribute: 'username', operator: 'eq', value: 'alice' })
  })

  it('parses co (contains) operator', () => {
    const result = parseScimFilter('emails.value co "@example.com"')
    expect(result).toEqual({ attribute: 'emails.value', operator: 'co', value: '@example.com' })
  })

  it('parses sw (starts with) operator', () => {
    const result = parseScimFilter('userName sw "ali"')
    expect(result).toEqual({ attribute: 'username', operator: 'sw', value: 'ali' })
  })

  it('returns null for malformed filter', () => {
    expect(parseScimFilter('invalid filter string')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseScimFilter('')).toBeNull()
  })

  it('lowercases attribute and operator', () => {
    const result = parseScimFilter('UserName EQ "alice"')
    expect(result?.attribute).toBe('username')
    expect(result?.operator).toBe('eq')
  })
})

describe('matchesFilter', () => {
  it('returns true for null filter (no filter applied)', () => {
    expect(matchesFilter(null, makeUser())).toBe(true)
  })

  it('matches userName eq exactly', () => {
    const user = makeUser({ userName: 'alice.johnson' })
    expect(matchesFilter({ attribute: 'username', operator: 'eq', value: 'alice.johnson' }, user)).toBe(true)
    expect(matchesFilter({ attribute: 'username', operator: 'eq', value: 'bob' }, user)).toBe(false)
  })

  it('matches userName sw (starts with)', () => {
    const user = makeUser({ userName: 'alice.johnson' })
    expect(matchesFilter({ attribute: 'username', operator: 'sw', value: 'alice' }, user)).toBe(true)
    expect(matchesFilter({ attribute: 'username', operator: 'sw', value: 'bob' }, user)).toBe(false)
  })

  it('matches userName co (contains)', () => {
    const user = makeUser({ userName: 'alice.johnson' })
    expect(matchesFilter({ attribute: 'username', operator: 'co', value: 'alice' }, user)).toBe(true)
    expect(matchesFilter({ attribute: 'username', operator: 'co', value: 'bob' }, user)).toBe(false)
  })

  it('matches emails.value co', () => {
    const user = makeUser({ emails: [{ value: 'alice@example.com', primary: true }] })
    expect(matchesFilter({ attribute: 'emails.value', operator: 'co', value: '@example.com' }, user)).toBe(true)
    expect(matchesFilter({ attribute: 'emails.value', operator: 'co', value: '@other.com' }, user)).toBe(false)
  })

  it('matches active eq', () => {
    expect(matchesFilter({ attribute: 'active', operator: 'eq', value: 'true' }, makeUser({ active: true }))).toBe(true)
    expect(matchesFilter({ attribute: 'active', operator: 'eq', value: 'false' }, makeUser({ active: true }))).toBe(false)
  })

  it('returns true for unknown attributes (non-blocking)', () => {
    expect(matchesFilter({ attribute: 'unknown.field', operator: 'eq', value: 'x' }, makeUser())).toBe(true)
  })
})

describe('matchesGroupFilter', () => {
  it('returns true for null filter', () => {
    expect(matchesGroupFilter(null, makeGroup())).toBe(true)
  })

  it('matches displayName eq', () => {
    const group = makeGroup({ displayName: 'Engineering' })
    expect(matchesGroupFilter({ attribute: 'displayname', operator: 'eq', value: 'engineering' }, group)).toBe(true)
    expect(matchesGroupFilter({ attribute: 'displayname', operator: 'eq', value: 'design' }, group)).toBe(false)
  })

  it('matches displayName co', () => {
    const group = makeGroup({ displayName: 'Engineering Team' })
    expect(matchesGroupFilter({ attribute: 'displayname', operator: 'co', value: 'engin' }, group)).toBe(true)
  })
})

describe('applyPatchToUser', () => {
  it('replaces active via path', () => {
    const user = makeUser({ active: true })
    const result = applyPatchToUser(user, [{ op: 'replace', path: 'active', value: false }])
    expect(result.active).toBe(false)
  })

  it('replaces userName via path', () => {
    const user = makeUser({ userName: 'old.name' })
    const result = applyPatchToUser(user, [{ op: 'replace', path: 'userName', value: 'new.name' }])
    expect(result.userName).toBe('new.name')
  })

  it('replaces name.givenName', () => {
    const user = makeUser({ name: { givenName: 'Alice', familyName: 'Johnson' } })
    const result = applyPatchToUser(user, [{ op: 'replace', path: 'name.givenName', value: 'Alicia' }])
    expect(result.name?.givenName).toBe('Alicia')
    expect(result.name?.familyName).toBe('Johnson')
  })

  it('removes displayName', () => {
    const user = makeUser({ displayName: 'Alice Johnson' })
    const result = applyPatchToUser(user, [{ op: 'remove', path: 'displayName' }])
    expect(result.displayName).toBeNull()
  })

  it('removes emails', () => {
    const user = makeUser({ emails: [{ value: 'alice@example.com', primary: true }] })
    const result = applyPatchToUser(user, [{ op: 'remove', path: 'emails' }])
    expect(result.emails).toEqual([])
  })

  it('applies multiple operations in order', () => {
    const user = makeUser({ active: true, displayName: 'Old' })
    const result = applyPatchToUser(user, [
      { op: 'replace', path: 'active', value: false },
      { op: 'replace', path: 'displayName', value: 'New' },
    ])
    expect(result.active).toBe(false)
    expect(result.displayName).toBe('New')
  })

  it('applies attribute map when path is absent (replace op)', () => {
    const user = makeUser({ active: true, displayName: 'Old' })
    const result = applyPatchToUser(user, [{ op: 'replace', value: { active: false, displayName: 'Updated' } }])
    expect(result.active).toBe(false)
    expect(result.displayName).toBe('Updated')
  })

  it('ignores unknown operations gracefully', () => {
    const user = makeUser()
    const result = applyPatchToUser(user, [{ op: 'unknown', path: 'whatever', value: 'x' }])
    expect(result).toEqual(user)
  })
})

describe('applyPatchToGroup', () => {
  it('extracts displayName from replace operation', () => {
    const result = applyPatchToGroup([{ op: 'replace', path: 'displayName', value: 'Design' }])
    expect(result.displayName).toBe('Design')
  })

  it('collects add member ids from add members operation', () => {
    const result = applyPatchToGroup([{ op: 'add', path: 'members', value: [{ value: 'u1' }, { value: 'u2' }] }])
    expect(result.memberPatches).toEqual([{ kind: 'add', ids: ['u1', 'u2'] }])
  })

  it('collects remove member ids from remove members operation', () => {
    const result = applyPatchToGroup([{ op: 'remove', path: 'members', value: [{ value: 'u1' }] }])
    expect(result.memberPatches).toEqual([{ kind: 'remove', ids: ['u1'] }])
  })

  it('signals replace_all for replace members operation', () => {
    const result = applyPatchToGroup([{ op: 'replace', path: 'members', value: [{ value: 'u2' }] }])
    expect(result.memberPatches).toEqual([{ kind: 'replace_all', ids: ['u2'] }])
  })

  it('signals remove_all for remove members without value', () => {
    const result = applyPatchToGroup([{ op: 'remove', path: 'members' }])
    expect(result.memberPatches).toEqual([{ kind: 'remove_all' }])
  })

  it('returns empty member patches for no-op patches', () => {
    const result = applyPatchToGroup([])
    expect(result.memberPatches).toEqual([])
    expect(result.displayName).toBeUndefined()
  })

  it('accumulates multiple member operations in order', () => {
    const result = applyPatchToGroup([
      { op: 'add', path: 'members', value: [{ value: 'u1' }] },
      { op: 'add', path: 'members', value: [{ value: 'u2' }] },
      { op: 'remove', path: 'members', value: [{ value: 'u1' }] },
    ])
    expect(result.memberPatches).toEqual([
      { kind: 'add', ids: ['u1'] },
      { kind: 'add', ids: ['u2'] },
      { kind: 'remove', ids: ['u1'] },
    ])
  })
})

describe('buildFormattedName', () => {
  it('joins given and family name', () => {
    expect(buildFormattedName({ givenName: 'Alice', familyName: 'Johnson' })).toBe('Alice Johnson')
  })

  it('returns only givenName when familyName is absent', () => {
    expect(buildFormattedName({ givenName: 'Alice', familyName: null })).toBe('Alice')
  })

  it('returns null when both names are absent', () => {
    expect(buildFormattedName({ givenName: null, familyName: null })).toBeNull()
  })

  it('includes middleName when provided', () => {
    expect(buildFormattedName({ givenName: 'Alice', middleName: 'Marie', familyName: 'Johnson' })).toBe('Alice Marie Johnson')
  })
})

describe('getScimBaseUrl', () => {
  it('constructs the correct base URL', () => {
    const url = new URL('https://tool.example.com/scim/abc123/v2/Users')
    expect(getScimBaseUrl(url, 'abc123')).toBe('https://tool.example.com/scim/abc123/v2')
  })
})

describe('parseStartIndex', () => {
  it('returns 1 for null', () => expect(parseStartIndex(null)).toBe(1))
  it('returns 1 for zero', () => expect(parseStartIndex('0')).toBe(1))
  it('returns 1 for negative', () => expect(parseStartIndex('-5')).toBe(1))
  it('returns parsed value for valid input', () => expect(parseStartIndex('10')).toBe(10))
  it('floors decimal input', () => expect(parseStartIndex('3.9')).toBe(3))
})

describe('parseCount', () => {
  it('returns 100 for null', () => expect(parseCount(null)).toBe(100))
  it('returns 100 for zero', () => expect(parseCount('0')).toBe(100))
  it('caps at 200', () => expect(parseCount('500')).toBe(200))
  it('returns parsed value within range', () => expect(parseCount('50')).toBe(50))
})
