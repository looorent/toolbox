<script setup lang="ts">
import { TbButton, TbCheckbox, TbCopyId, TbInput, TbSelect } from '@components'
import { ref } from 'vue'
import { getUserDisplayName, getUserPrimaryEmail } from './logic'
import type { CreateUserInput, ScimGroup, ScimUser, UpdateUserInput } from './types'

const props = defineProps<{
  users: ScimUser[]
  groups: ScimGroup[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  createUser: [input: CreateUserInput]
  updateUser: [userId: string, input: UpdateUserInput]
  deleteUser: [userId: string]
}>()

const showCreateForm = ref(false)
const expandedUserId = ref<string | null>(null)

const createForm = ref<CreateUserInput>({ userName: '', displayName: '', externalId: '', givenName: '', middleName: '', familyName: '', emails: [{ value: '', type: 'work', primary: true }], title: '', preferredLanguage: '', locale: '', timezone: '', active: true })
const editForm = ref<UpdateUserInput>({})

function openCreateForm(): void {
  createForm.value = { userName: '', displayName: '', externalId: '', givenName: '', middleName: '', familyName: '', emails: [{ value: '', type: 'work', primary: true }], title: '', preferredLanguage: '', locale: '', timezone: '', active: true }
  showCreateForm.value = true
  expandedUserId.value = null
}

function toggleExpand(user: ScimUser): void {
  if (expandedUserId.value === user.id) {
    expandedUserId.value = null
  } else {
    editForm.value = {
      userName: user.userName,
      displayName: user.displayName ?? '',
      externalId: user.externalId ?? '',
      givenName: user.name?.givenName ?? '',
      middleName: user.name?.middleName ?? '',
      familyName: user.name?.familyName ?? '',
      emails: user.emails && user.emails.length > 0 ? user.emails.map(email => ({ ...email })) : [{ value: '', type: 'work', primary: true }],
      title: user.title ?? '',
      preferredLanguage: user.preferredLanguage ?? '',
      locale: user.locale ?? '',
      timezone: user.timezone ?? '',
      active: user.active,
    }
    expandedUserId.value = user.id
    showCreateForm.value = false
  }
}

function cancelForms(): void {
  showCreateForm.value = false
  expandedUserId.value = null
}

function submitCreate(): void {
  if (!createForm.value.userName?.trim()) {
    return
  }
  emit('createUser', { ...createForm.value })
  showCreateForm.value = false
}

function submitEdit(userId: string): void {
  emit('updateUser', userId, { ...editForm.value })
  expandedUserId.value = null
}

function addEmailToCreate(): void {
  createForm.value.emails = [...(createForm.value.emails ?? []), { value: '', type: 'work', primary: false }]
}

function removeEmailFromCreate(index: number): void {
  createForm.value.emails = (createForm.value.emails ?? []).filter((_, emailIndex) => emailIndex !== index)
}

function setPrimaryCreateEmail(index: number): void {
  createForm.value.emails = (createForm.value.emails ?? []).map((email, emailIndex) => ({
    ...email,
    primary: emailIndex === index,
  }))
}

function addEmailToEdit(): void {
  editForm.value.emails = [...(editForm.value.emails ?? []), { value: '', type: 'work', primary: false }]
}

function removeEmailFromEdit(index: number): void {
  editForm.value.emails = (editForm.value.emails ?? []).filter((_, emailIndex) => emailIndex !== index)
}

function setPrimaryEditEmail(index: number): void {
  editForm.value.emails = (editForm.value.emails ?? []).map((email, emailIndex) => ({
    ...email,
    primary: emailIndex === index,
  }))
}

function getGroupNames(user: ScimUser): string {
  const names = (user.groups ?? [])
    .map(ref => props.groups.find(g => g.id === ref.value)?.displayName ?? ref.display ?? ref.value)
    .filter(Boolean)
  return names.join(', ')
}
</script>

<template>
  <div class="tb-stack-4">
    <div class="tb-row tb-row--between">
      <h2 class="tb-section-title">
        Users
        <span class="tb-badge tb-ml-3">{{ users.length }}</span>
      </h2>
      <TbButton
        variant="secondary"
        size="sm"
        @click="openCreateForm"
      >
        + Add User
      </TbButton>
    </div>

    <!-- Create form -->
    <div v-if="showCreateForm" class="tb-card--accent">
      <div class="tb-row tb-row--between tb-mb-6">
        <h3 class="tb-section-subtitle">New User</h3>
        <div class="tb-row tb-row--gap-2">
          <TbButton variant="primary" size="sm" @click="submitCreate">Create</TbButton>
          <TbButton variant="secondary" size="sm" @click="cancelForms">Cancel</TbButton>
        </div>
      </div>
      <div class="tb-kv-table tb-kv-table--form">
        <div class="tb-kv-table__row">
          <span class="tb-kv-table__key">Username <span class="tb-text-error">*</span></span>
          <div class="tb-kv-table__value">
            <TbInput v-model="createForm.userName" class="tb-font-mono" placeholder="alice.johnson" @keydown.enter="submitCreate" @keydown.esc="cancelForms" />
          </div>
        </div>
        <div class="tb-kv-table__row">
          <span class="tb-kv-table__key">Display Name</span>
          <div class="tb-kv-table__value">
            <TbInput v-model="createForm.displayName" placeholder="Alice Johnson" />
          </div>
        </div>
        <div class="tb-kv-table__row">
          <span class="tb-kv-table__key">External ID</span>
          <div class="tb-kv-table__value">
            <TbInput v-model="createForm.externalId" class="tb-font-mono" placeholder="ext-123" />
          </div>
        </div>
        <div class="tb-kv-table__row">
          <span class="tb-kv-table__key">First Name</span>
          <div class="tb-kv-table__value">
            <TbInput v-model="createForm.givenName" placeholder="Alice" />
          </div>
        </div>
        <div class="tb-kv-table__row">
          <span class="tb-kv-table__key">Middle Name</span>
          <div class="tb-kv-table__value">
            <TbInput v-model="createForm.middleName" placeholder="Marie" />
          </div>
        </div>
        <div class="tb-kv-table__row">
          <span class="tb-kv-table__key">Last Name</span>
          <div class="tb-kv-table__value">
            <TbInput v-model="createForm.familyName" placeholder="Johnson" />
          </div>
        </div>
        <div class="tb-kv-table__row">
          <span class="tb-kv-table__key">Title</span>
          <div class="tb-kv-table__value">
            <TbInput v-model="createForm.title" placeholder="Software Engineer" />
          </div>
        </div>
        <div class="tb-kv-table__row">
          <span class="tb-kv-table__key">Language</span>
          <div class="tb-kv-table__value">
            <TbInput v-model="createForm.preferredLanguage" placeholder="en-US" />
          </div>
        </div>
        <div class="tb-kv-table__row">
          <span class="tb-kv-table__key">Locale</span>
          <div class="tb-kv-table__value">
            <TbInput v-model="createForm.locale" placeholder="en-US" />
          </div>
        </div>
        <div class="tb-kv-table__row">
          <span class="tb-kv-table__key">Timezone</span>
          <div class="tb-kv-table__value">
            <TbInput v-model="createForm.timezone" placeholder="America/New_York" />
          </div>
        </div>
        <div class="tb-kv-table__row tb-kv-table__row--top">
          <span class="tb-kv-table__key">
            Emails
            <button type="button" class="tb-btn-mini tb-ml-auto" @click="addEmailToCreate">+</button>
          </span>
          <div class="tb-kv-table__value tb-kv-table__value--padded">
            <div class="tb-stack-3">
              <div
                v-for="(email, index) in (createForm.emails ?? [])"
                :key="index"
                class="tb-row tb-row--gap-3"
              >
                <TbInput
                  v-model="email.value"
                  type="email"
                  size="sm"
                  class="tb-flex-1"
                  placeholder="alice@example.com"
                />
                <TbSelect v-model="email.type" class="tb-w-20">
                  <option value="work">work</option>
                  <option value="home">home</option>
                  <option value="other">other</option>
                </TbSelect>
                <button
                  type="button"
                  class="tb-chip"
                  :class="email.primary ? 'tb-chip--active' : ''"
                  @click="setPrimaryCreateEmail(index)"
                >
                  primary
                </button>
                <button
                  type="button"
                  class="tb-btn-icon tb-btn-icon--danger"
                  aria-label="Remove email"
                  @click="removeEmailFromCreate(index)"
                >
                  <svg class="tb-icon-sm" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="tb-kv-table__row">
          <span class="tb-kv-table__key">Active</span>
          <div class="tb-kv-table__value tb-kv-table__value--padded">
            <TbCheckbox v-model="createForm.active" label="Enabled" />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="tb-empty-text">Loading users…</div>

    <!-- Empty state -->
    <div v-else-if="users.length === 0 && !showCreateForm" class="tb-empty-text">
      No users yet. Click "Add User" to create the first one.
    </div>

    <!-- User list -->
    <div v-else class="tb-stack-1">
      <div
        v-for="user in users"
        :key="user.id"
        class="tb-expandable"
      >
        <!-- User row (expandable header) -->
        <div class="tb-group tb-expandable__header" @click="toggleExpand(user)">
          <svg
            class="tb-icon-md tb-chevron"
            :class="{ 'tb-chevron--open': expandedUserId === user.id }"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <div class="tb-avatar">
            <span class="tb-text-xs tb-font-semibold tb-text-accent">{{ getUserDisplayName(user).charAt(0).toUpperCase() }}</span>
          </div>
          <div class="tb-flex-fill">
            <div class="tb-row tb-row--gap-2">
              <span class="tb-text-sm tb-font-medium tb-text-primary tb-truncate">{{ getUserDisplayName(user) }}</span>
              <span
                class="tb-badge"
                :class="user.active ? 'tb-badge--valid' : ''"
              >
                {{ user.active ? 'Active' : 'Inactive' }}
              </span>
              <TbCopyId :value="user.id" />
            </div>
            <div class="tb-row tb-row--gap-3 tb-mt-1">
              <span class="tb-code-inline tb-text-muted tb-truncate">{{ user.userName }}</span>
              <span v-if="getUserPrimaryEmail(user)" class="tb-hint tb-truncate">{{ getUserPrimaryEmail(user) }}</span>
              <span v-if="getGroupNames(user)" class="tb-hint tb-truncate">{{ getGroupNames(user) }}</span>
            </div>
          </div>
          <button
            type="button"
            class="tb-btn-icon tb-btn-icon--danger tb-flex-shrink-0 tb-group-hover-visible"
            aria-label="Delete user"
            @click.stop="emit('deleteUser', user.id)"
          >
            <svg class="tb-icon-sm" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <!-- Edit form (expandable body) -->
        <div v-if="expandedUserId === user.id" class="tb-expandable__body">
          <div class="tb-row tb-row--between tb-mb-6">
            <span class="tb-hint">Edit fields and save</span>
            <div class="tb-row tb-row--gap-2">
              <TbButton variant="primary" size="sm" @click="submitEdit(user.id)">Save</TbButton>
              <TbButton variant="secondary" size="sm" @click="cancelForms">Cancel</TbButton>
            </div>
          </div>
          <div class="tb-kv-table tb-kv-table--form">
            <div class="tb-kv-table__row">
              <span class="tb-kv-table__key">Username <span class="tb-text-error">*</span></span>
              <div class="tb-kv-table__value">
                <TbInput v-model="editForm.userName" class="tb-font-mono" @keydown.esc="cancelForms" />
              </div>
            </div>
            <div class="tb-kv-table__row">
              <span class="tb-kv-table__key">Display Name</span>
              <div class="tb-kv-table__value">
                <TbInput v-model="editForm.displayName" />
              </div>
            </div>
            <div class="tb-kv-table__row">
              <span class="tb-kv-table__key">External ID</span>
              <div class="tb-kv-table__value">
                <TbInput v-model="editForm.externalId" class="tb-font-mono" />
              </div>
            </div>
            <div class="tb-kv-table__row">
              <span class="tb-kv-table__key">First Name</span>
              <div class="tb-kv-table__value">
                <TbInput v-model="editForm.givenName" />
              </div>
            </div>
            <div class="tb-kv-table__row">
              <span class="tb-kv-table__key">Middle Name</span>
              <div class="tb-kv-table__value">
                <TbInput v-model="editForm.middleName" />
              </div>
            </div>
            <div class="tb-kv-table__row">
              <span class="tb-kv-table__key">Last Name</span>
              <div class="tb-kv-table__value">
                <TbInput v-model="editForm.familyName" />
              </div>
            </div>
            <div class="tb-kv-table__row">
              <span class="tb-kv-table__key">Title</span>
              <div class="tb-kv-table__value">
                <TbInput v-model="editForm.title" />
              </div>
            </div>
            <div class="tb-kv-table__row">
              <span class="tb-kv-table__key">Language</span>
              <div class="tb-kv-table__value">
                <TbInput v-model="editForm.preferredLanguage" />
              </div>
            </div>
            <div class="tb-kv-table__row">
              <span class="tb-kv-table__key">Locale</span>
              <div class="tb-kv-table__value">
                <TbInput v-model="editForm.locale" />
              </div>
            </div>
            <div class="tb-kv-table__row">
              <span class="tb-kv-table__key">Timezone</span>
              <div class="tb-kv-table__value">
                <TbInput v-model="editForm.timezone" />
              </div>
            </div>
            <div class="tb-kv-table__row tb-kv-table__row--top">
              <span class="tb-kv-table__key">
                Emails
                <button type="button" class="tb-btn-mini tb-ml-auto" @click="addEmailToEdit">+</button>
              </span>
              <div class="tb-kv-table__value tb-kv-table__value--padded">
                <div class="tb-stack-3">
                  <div
                    v-for="(email, index) in (editForm.emails ?? [])"
                    :key="index"
                    class="tb-row tb-row--gap-3"
                  >
                    <TbInput
                      v-model="email.value"
                      type="email"
                      size="sm"
                      class="tb-flex-1"
                      placeholder="alice@example.com"
                    />
                    <TbSelect v-model="email.type" class="tb-w-20">
                      <option value="work">work</option>
                      <option value="home">home</option>
                      <option value="other">other</option>
                    </TbSelect>
                    <button
                      type="button"
                      class="tb-chip"
                      :class="email.primary ? 'tb-chip--active' : ''"
                      @click="setPrimaryEditEmail(index)"
                    >
                      primary
                    </button>
                    <button
                      type="button"
                      class="tb-btn-icon tb-btn-icon--danger"
                      aria-label="Remove email"
                      @click="removeEmailFromEdit(index)"
                    >
                      <svg class="tb-icon-sm" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="tb-kv-table__row">
              <span class="tb-kv-table__key">Active</span>
              <div class="tb-kv-table__value tb-kv-table__value--padded">
                <TbCheckbox v-model="editForm.active" label="Enabled" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
