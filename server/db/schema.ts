import { index, integer, primaryKey, type SQLiteTableExtraConfigValue, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const scimServer = sqliteTable('scim_server', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  bearerToken: text('bearer_token'),
  createdAt: text('created_at').notNull(),
  lastUsedAt: text('last_used_at'),
})

export const scimUser = sqliteTable(
  'scim_user',
  {
    id: text('id').primaryKey(),
    serverId: text('server_id')
      .notNull()
      .references(() => scimServer.id, { onDelete: 'cascade' }),
    externalId: text('external_id'),
    userName: text('user_name').notNull(),
    displayName: text('display_name'),
    givenName: text('given_name'),
    familyName: text('family_name'),
    middleName: text('middle_name'),
    formattedName: text('formatted_name'),
    title: text('title'),
    preferredLanguage: text('preferred_language'),
    locale: text('locale'),
    timezone: text('timezone'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    emails: text('emails'), // JSON: ScimEmail[]
    phoneNumbers: text('phone_numbers'), // JSON: ScimPhoneNumber[]
    addresses: text('addresses'), // JSON: ScimAddress[]
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  table => [
    index('scim_user_server_id_idx').on(table.serverId),
    uniqueIndex('scim_user_server_id_user_name_idx').on(table.serverId, table.userName),
  ],
)

export const scimGroup = sqliteTable(
  'scim_group',
  {
    id: text('id').primaryKey(),
    serverId: text('server_id')
      .notNull()
      .references(() => scimServer.id, { onDelete: 'cascade' }),
    externalId: text('external_id'),
    displayName: text('display_name').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  table => [
    index('scim_group_server_id_idx').on(table.serverId),
    index('scim_group_server_id_display_name_idx').on(table.serverId, table.displayName),
  ],
)

export const scimGroupMember = sqliteTable(
  'scim_group_member',
  {
    groupId: text('group_id')
      .notNull()
      .references(() => scimGroup.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => scimUser.id, { onDelete: 'cascade' }),
  },
  (table): SQLiteTableExtraConfigValue[] => [
    primaryKey({ columns: [table.groupId, table.userId] }),
    index('scim_group_member_user_id_idx').on(table.userId),
  ],
)
