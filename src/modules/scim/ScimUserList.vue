<script setup lang="ts">
import { useCopy } from '@composables/useCopy'
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

const { copy, copiedKey } = useCopy()

const showCreateForm = ref(false)
const editingUserId = ref<string | null>(null)

const createForm = ref<CreateUserInput>({ userName: '', displayName: '', externalId: '', givenName: '', middleName: '', familyName: '', emails: [{ value: '', type: 'work', primary: true }], title: '', preferredLanguage: '', locale: '', timezone: '', active: true })
const editForm = ref<UpdateUserInput>({})

function openCreateForm(): void {
  createForm.value = { userName: '', displayName: '', externalId: '', givenName: '', middleName: '', familyName: '', emails: [{ value: '', type: 'work', primary: true }], title: '', preferredLanguage: '', locale: '', timezone: '', active: true }
  showCreateForm.value = true
  editingUserId.value = null
}

function openEditForm(user: ScimUser): void {
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
  editingUserId.value = user.id
  showCreateForm.value = false
}

function cancelForms(): void {
  showCreateForm.value = false
  editingUserId.value = null
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
  editingUserId.value = null
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
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-text-primary">
        Users
        <span class="ml-1.5 px-1.5 py-0.5 text-xs font-normal bg-surface-raised border border-border rounded text-text-muted">{{ users.length }}</span>
      </h2>
      <button
        type="button"
        class="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors cursor-pointer"
        @click="openCreateForm"
      >
        + Add User
      </button>
    </div>

    <!-- Create form -->
    <div v-if="showCreateForm" class="p-4 bg-surface-raised rounded-lg border border-accent/30">
      <h3 class="text-xs font-semibold text-text-primary mb-3">New User</h3>
      <div class="grid grid-cols-2 gap-3">
        <div class="col-span-2">
          <label class="block text-xs text-text-muted mb-1">Username <span class="text-error">*</span></label>
          <input
            v-model="createForm.userName"
            class="w-full px-2.5 py-1.5 text-xs font-mono bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="alice.johnson"
            @keydown.enter="submitCreate"
            @keydown.esc="cancelForms"
          />
        </div>
        <div>
          <label class="block text-xs text-text-muted mb-1">Display Name</label>
          <input
            v-model="createForm.displayName"
            class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="Alice Johnson"
          />
        </div>
        <div>
          <label class="block text-xs text-text-muted mb-1">External ID</label>
          <input
            v-model="createForm.externalId"
            class="w-full px-2.5 py-1.5 text-xs font-mono bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="ext-123"
          />
        </div>
        <div>
          <label class="block text-xs text-text-muted mb-1">First Name</label>
          <input
            v-model="createForm.givenName"
            class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="Alice"
          />
        </div>
        <div>
          <label class="block text-xs text-text-muted mb-1">Last Name</label>
          <input
            v-model="createForm.familyName"
            class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="Johnson"
          />
        </div>
        <div>
          <label class="block text-xs text-text-muted mb-1">Middle Name</label>
          <input
            v-model="createForm.middleName"
            class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="Marie"
          />
        </div>
        <div class="col-span-2">
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs text-text-muted">Emails</label>
            <button
              type="button"
              class="px-1.5 py-0.5 text-[11px] rounded border bg-surface border-border text-text-muted hover:border-border-focus hover:text-text-secondary transition-colors cursor-pointer"
              @click="addEmailToCreate"
            >
              + Add
            </button>
          </div>
          <div class="flex flex-col gap-1.5">
            <div
              v-for="(email, index) in (createForm.emails ?? [])"
              :key="index"
              class="flex items-center gap-1.5"
            >
              <input
                v-model="email.value"
                type="email"
                class="flex-1 px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
                placeholder="alice@example.com"
              />
              <select
                v-model="email.type"
                class="w-20 px-2 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary"
              >
                <option value="work">work</option>
                <option value="home">home</option>
                <option value="other">other</option>
              </select>
              <button
                type="button"
                class="shrink-0 px-1.5 py-0.5 text-[10px] rounded border cursor-pointer transition-colors"
                :class="email.primary ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-surface border-border text-text-muted hover:border-border-focus'"
                title="Set as primary"
                @click="setPrimaryCreateEmail(index)"
              >
                primary
              </button>
              <button
                type="button"
                class="shrink-0 p-1 text-text-muted hover:text-error transition-colors cursor-pointer"
                @click="removeEmailFromCreate(index)"
              >
                <svg class="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-xs text-text-muted mb-1">Title</label>
          <input
            v-model="createForm.title"
            class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="Software Engineer"
          />
        </div>
        <div>
          <label class="block text-xs text-text-muted mb-1">Preferred Language</label>
          <input
            v-model="createForm.preferredLanguage"
            class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="en-US"
          />
        </div>
        <div>
          <label class="block text-xs text-text-muted mb-1">Locale</label>
          <input
            v-model="createForm.locale"
            class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="en-US"
          />
        </div>
        <div>
          <label class="block text-xs text-text-muted mb-1">Timezone</label>
          <input
            v-model="createForm.timezone"
            class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="America/New_York"
          />
        </div>
        <div class="col-span-2 flex items-center gap-2">
          <input id="create-active" v-model="createForm.active" type="checkbox" class="rounded" />
          <label for="create-active" class="text-xs text-text-secondary">Active</label>
        </div>
      </div>
      <div class="flex items-center gap-2 mt-3">
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:opacity-90 transition-opacity cursor-pointer"
          @click="submitCreate"
        >
          Create
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-secondary hover:border-border-focus transition-colors cursor-pointer"
          @click="cancelForms"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-8 text-text-muted text-xs">Loading users…</div>

    <!-- Empty state -->
    <div v-else-if="users.length === 0 && !showCreateForm" class="text-center py-8 text-text-muted text-xs">
      No users yet. Click "Add User" to create the first one.
    </div>

    <!-- User list -->
    <div v-else class="flex flex-col gap-1">
      <div
        v-for="user in users"
        :key="user.id"
        class="group rounded-lg border border-border bg-surface-raised overflow-hidden"
      >
        <!-- Edit form for this user -->
        <div v-if="editingUserId === user.id" class="p-4">
          <h3 class="text-xs font-semibold text-text-primary mb-3">Edit User</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label class="block text-xs text-text-muted mb-1">Username <span class="text-error">*</span></label>
              <input
                v-model="editForm.userName"
                class="w-full px-2.5 py-1.5 text-xs font-mono bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary"
                @keydown.esc="cancelForms"
              />
            </div>
            <div>
              <label class="block text-xs text-text-muted mb-1">Display Name</label>
              <input v-model="editForm.displayName" class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary" />
            </div>
            <div>
              <label class="block text-xs text-text-muted mb-1">External ID</label>
              <input v-model="editForm.externalId" class="w-full px-2.5 py-1.5 text-xs font-mono bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary" />
            </div>
            <div>
              <label class="block text-xs text-text-muted mb-1">First Name</label>
              <input v-model="editForm.givenName" class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary" />
            </div>
            <div>
              <label class="block text-xs text-text-muted mb-1">Last Name</label>
              <input v-model="editForm.familyName" class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary" />
            </div>
            <div>
              <label class="block text-xs text-text-muted mb-1">Middle Name</label>
              <input v-model="editForm.middleName" class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary" />
            </div>
            <div class="col-span-2">
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs text-text-muted">Emails</label>
                <button
                  type="button"
                  class="px-1.5 py-0.5 text-[11px] rounded border bg-surface border-border text-text-muted hover:border-border-focus hover:text-text-secondary transition-colors cursor-pointer"
                  @click="addEmailToEdit"
                >
                  + Add
                </button>
              </div>
              <div class="flex flex-col gap-1.5">
                <div
                  v-for="(email, index) in (editForm.emails ?? [])"
                  :key="index"
                  class="flex items-center gap-1.5"
                >
                  <input
                    v-model="email.value"
                    type="email"
                    class="flex-1 px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
                    placeholder="alice@example.com"
                  />
                  <select
                    v-model="email.type"
                    class="w-20 px-2 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary"
                  >
                    <option value="work">work</option>
                    <option value="home">home</option>
                    <option value="other">other</option>
                  </select>
                  <button
                    type="button"
                    class="shrink-0 px-1.5 py-0.5 text-[10px] rounded border cursor-pointer transition-colors"
                    :class="email.primary ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-surface border-border text-text-muted hover:border-border-focus'"
                    title="Set as primary"
                    @click="setPrimaryEditEmail(index)"
                  >
                    primary
                  </button>
                  <button
                    type="button"
                    class="shrink-0 p-1 text-text-muted hover:text-error transition-colors cursor-pointer"
                    @click="removeEmailFromEdit(index)"
                  >
                    <svg class="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-xs text-text-muted mb-1">Title</label>
              <input v-model="editForm.title" class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary" />
            </div>
            <div>
              <label class="block text-xs text-text-muted mb-1">Preferred Language</label>
              <input v-model="editForm.preferredLanguage" class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary" />
            </div>
            <div>
              <label class="block text-xs text-text-muted mb-1">Locale</label>
              <input v-model="editForm.locale" class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary" />
            </div>
            <div>
              <label class="block text-xs text-text-muted mb-1">Timezone</label>
              <input v-model="editForm.timezone" class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary" />
            </div>
            <div class="col-span-2 flex items-center gap-2">
              <input :id="`edit-active-${user.id}`" v-model="editForm.active" type="checkbox" class="rounded" />
              <label :for="`edit-active-${user.id}`" class="text-xs text-text-secondary">Active</label>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-3">
            <button
              type="button"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:opacity-90 transition-opacity cursor-pointer"
              @click="submitEdit(user.id)"
            >
              Save
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface border border-border text-text-secondary hover:border-border-focus transition-colors cursor-pointer"
              @click="cancelForms"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- User row -->
        <div v-else class="flex items-center gap-3 px-4 py-3">
          <div class="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
            <span class="text-xs font-semibold text-accent">{{ getUserDisplayName(user).charAt(0).toUpperCase() }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-text-primary truncate">{{ getUserDisplayName(user) }}</span>
              <span
                class="shrink-0 px-1.5 py-0.5 text-xs rounded-full"
                :class="user.active ? 'bg-success/10 text-success border border-success/20' : 'bg-surface-overlay border border-border text-text-muted'"
              >
                {{ user.active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="flex items-center gap-3 mt-0.5">
              <span class="text-xs font-mono text-text-muted truncate">{{ user.userName }}</span>
              <span v-if="getUserPrimaryEmail(user)" class="text-xs text-text-muted truncate">{{ getUserPrimaryEmail(user) }}</span>
              <span v-if="getGroupNames(user)" class="text-xs text-text-muted truncate">{{ getGroupNames(user) }}</span>
              <button
                type="button"
                class="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-mono text-xs transition-colors cursor-pointer"
                :class="copiedKey === user.id ? 'bg-success/10 border-success/20 text-success' : 'bg-surface border-border text-text-muted hover:border-border-focus hover:text-text-secondary'"
                :title="user.id"
                @click.stop="copy(user.id, user.id)"
              >
                <span>{{ copiedKey === user.id ? 'copied!' : `${user.id.slice(0, 8)}…` }}</span>
                <svg v-if="copiedKey !== user.id" class="w-3 h-3 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              type="button"
              class="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors cursor-pointer"
              title="Edit user"
              @click="openEditForm(user)"
            >
              <svg class="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              class="p-1.5 rounded text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
              title="Delete user"
              @click="emit('deleteUser', user.id)"
            >
              <svg class="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
