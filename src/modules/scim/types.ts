export type {
  CreateGroupInput,
  CreateServerInput,
  CreateUserInput,
  ScimEmail,
  ScimGroup,
  ScimGroupsPage,
  ScimMember,
  ScimServer,
  ScimUser,
  ScimUsersPage,
  UpdateGroupInput,
  UpdateUserInput,
} from '@shared/modules/scim/types'

export type ActiveTab = 'users' | 'groups' | 'api' | 'compliance'

export interface ServerWithCounts {
  id: string
  name: string
  bearerToken?: string
  createdAt: string
  userCount: number
  groupCount: number
}
