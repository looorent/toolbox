import * as v from 'valibot'

export const ScimEmailSchema = v.object({
  value: v.string(),
  type: v.optional(v.string()),
  primary: v.optional(v.boolean()),
})

export const ScimPhoneNumberSchema = v.object({
  value: v.string(),
  type: v.optional(v.string()),
})

export const ScimAddressSchema = v.object({
  formatted: v.optional(v.string()),
  streetAddress: v.optional(v.string()),
  locality: v.optional(v.string()),
  region: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  country: v.optional(v.string()),
  type: v.optional(v.string()),
  primary: v.optional(v.boolean()),
})

const ScimNameSchema = v.object({
  formatted: v.optional(v.nullable(v.string())),
  givenName: v.optional(v.nullable(v.string())),
  familyName: v.optional(v.nullable(v.string())),
  middleName: v.optional(v.nullable(v.string())),
})

const ScimMemberSchema = v.object({
  value: v.string(),
  display: v.optional(v.string()),
})

export const CreateServerInputSchema = v.object({
  name: v.optional(v.string()),
  prepopulate: v.optional(v.boolean()),
})

export const CreateUserInputSchema = v.object({
  userName: v.optional(v.string()),
  displayName: v.optional(v.string()),
  externalId: v.optional(v.string()),
  givenName: v.optional(v.string()),
  middleName: v.optional(v.string()),
  familyName: v.optional(v.string()),
  emails: v.optional(v.array(ScimEmailSchema)),
  title: v.optional(v.string()),
  preferredLanguage: v.optional(v.string()),
  locale: v.optional(v.string()),
  timezone: v.optional(v.string()),
  active: v.optional(v.boolean()),
})

export const UpdateUserInputSchema = v.object({
  userName: v.optional(v.string()),
  displayName: v.optional(v.string()),
  externalId: v.optional(v.string()),
  givenName: v.optional(v.string()),
  middleName: v.optional(v.string()),
  familyName: v.optional(v.string()),
  emails: v.optional(v.array(ScimEmailSchema)),
  title: v.optional(v.string()),
  preferredLanguage: v.optional(v.string()),
  locale: v.optional(v.string()),
  timezone: v.optional(v.string()),
  active: v.optional(v.boolean()),
})

export const CreateGroupInputSchema = v.object({
  displayName: v.optional(v.string()),
  externalId: v.optional(v.string()),
  memberIds: v.optional(v.array(v.string())),
})

export const UpdateGroupInputSchema = v.object({
  displayName: v.optional(v.string()),
  externalId: v.optional(v.string()),
  memberIds: v.optional(v.array(v.string())),
})

export const AddGroupMemberInputSchema = v.object({
  userId: v.string(),
})

export const ScimUserBodySchema = v.object({
  schemas: v.optional(v.array(v.string())),
  userName: v.optional(v.string()),
  displayName: v.optional(v.string()),
  externalId: v.optional(v.nullable(v.string())),
  name: v.optional(ScimNameSchema),
  title: v.optional(v.string()),
  preferredLanguage: v.optional(v.string()),
  locale: v.optional(v.string()),
  timezone: v.optional(v.string()),
  active: v.optional(v.boolean()),
  emails: v.optional(v.array(ScimEmailSchema)),
  phoneNumbers: v.optional(v.array(ScimPhoneNumberSchema)),
  addresses: v.optional(v.array(ScimAddressSchema)),
})

export const ScimGroupBodySchema = v.object({
  schemas: v.optional(v.array(v.string())),
  displayName: v.optional(v.string()),
  externalId: v.optional(v.nullable(v.string())),
  members: v.optional(v.array(ScimMemberSchema)),
})

const PatchOperationSchema = v.object({
  op: v.string(),
  path: v.optional(v.string()),
  value: v.optional(v.unknown()),
})

export const PatchOpSchema = v.object({
  schemas: v.optional(v.array(v.string())),
  Operations: v.optional(v.array(PatchOperationSchema)),
})
