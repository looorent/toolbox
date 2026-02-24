export interface ScimServer {
  id: string
  name: string
  bearerToken?: string
  createdAt: string
}

export interface ScimEmail {
  value: string
  type?: string
  primary?: boolean
}

export interface ScimPhoneNumber {
  value: string
  type?: string
}

export interface ScimAddress {
  formatted?: string
  streetAddress?: string
  locality?: string
  region?: string
  postalCode?: string
  country?: string
  type?: string
  primary?: boolean
}

export interface ScimName {
  formatted?: string | null
  givenName?: string | null
  familyName?: string | null
  middleName?: string | null
}

export interface ScimGroupRef {
  value: string
  display?: string
  type?: string
}

export interface ScimUser {
  id: string
  serverId: string
  externalId?: string | null
  userName: string
  displayName?: string | null
  name?: ScimName
  title?: string | null
  preferredLanguage?: string | null
  locale?: string | null
  timezone?: string | null
  active: boolean
  emails?: ScimEmail[]
  phoneNumbers?: ScimPhoneNumber[]
  addresses?: ScimAddress[]
  groups?: ScimGroupRef[]
  createdAt: string
  updatedAt: string
}

export interface ScimMember {
  value: string
  display?: string
}

export interface ScimGroup {
  id: string
  serverId: string
  externalId?: string | null
  displayName: string
  members?: ScimMember[]
  createdAt: string
  updatedAt: string
}

export interface CreateUserInput {
  userName: string
  displayName?: string
  externalId?: string
  givenName?: string
  middleName?: string
  familyName?: string
  emails?: ScimEmail[]
  title?: string
  preferredLanguage?: string
  locale?: string
  timezone?: string
  active?: boolean
}

export interface UpdateUserInput {
  userName?: string
  displayName?: string
  externalId?: string
  givenName?: string
  middleName?: string
  familyName?: string
  emails?: ScimEmail[]
  title?: string
  preferredLanguage?: string
  locale?: string
  timezone?: string
  active?: boolean
}

export interface CreateGroupInput {
  displayName: string
  externalId?: string
  memberIds?: string[]
}

export interface UpdateGroupInput {
  displayName?: string
  externalId?: string
  memberIds?: string[]
}

export interface CreateServerInput {
  name: string
  prepopulate?: boolean
}

export interface ScimUsersPage {
  users: ScimUser[]
  total: number
}

export interface ScimGroupsPage {
  groups: ScimGroup[]
  total: number
}
