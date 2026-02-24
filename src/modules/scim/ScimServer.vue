<script setup lang="ts">
import type { CreateGroupInput, CreateUserInput, ScimGroup, ScimUser, UpdateGroupInput, UpdateUserInput } from '@shared/modules/scim/types'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  createGroup,
  createServer,
  createUser,
  deleteGroup,
  deleteServer,
  deleteUser,
  fetchGroups,
  fetchServer,
  fetchUsers,
  getScimBaseUrl,
  updateGroup,
  updateUser,
} from './logic'
import ScimApiDocs from './ScimApiDocs.vue'
import ScimCompliance from './ScimCompliance.vue'
import ScimGroupList from './ScimGroupList.vue'
import ScimLanding from './ScimLanding.vue'
import ScimToolbar from './ScimToolbar.vue'
import ScimUserList from './ScimUserList.vue'
import type { ActiveTab, ServerWithCounts } from './types'

const route = useRoute()
const router = useRouter()

const serverId = ref<string | undefined>(route.params.id as string | undefined)
const server = ref<ServerWithCounts | null>(null)
const bearerToken = ref<string | null>(null)
const users = ref<ScimUser[]>([])
const groups = ref<ScimGroup[]>([])
const activeTab = ref<ActiveTab>('users')
const isCreating = ref(false)
const isDeleting = ref(false)
const isLoadingUsers = ref(false)
const isLoadingGroups = ref(false)
const loadError = ref<string | null>(null)

const scimBaseUrl = ref('')

let pendingBearerToken: string | null = null

async function handleCreateServer(prepopulate: boolean): Promise<void> {
  isCreating.value = true
  loadError.value = null
  try {
    const name = `Server ${new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    const created = await createServer({ name, prepopulate })
    pendingBearerToken = created.bearerToken ?? null
    bearerToken.value = pendingBearerToken
    await router.push(`/scim/${created.id}`)
  } catch {
    loadError.value = 'Failed to create SCIM server. Please try again.'
  } finally {
    isCreating.value = false
  }
}

async function handleDeleteServer(): Promise<void> {
  if (!serverId.value) {
    return
  }
  isDeleting.value = true
  try {
    await deleteServer(serverId.value)
    await router.push('/scim')
  } catch {
    loadError.value = 'Failed to delete server.'
  } finally {
    isDeleting.value = false
  }
}

async function initServer(): Promise<void> {
  if (!serverId.value) {
    return
  }
  try {
    server.value = await fetchServer(serverId.value)
    scimBaseUrl.value = getScimBaseUrl(serverId.value)
    loadError.value = null
    await Promise.all([loadUsers(), loadGroups()])
  } catch {
    loadError.value = 'Failed to load SCIM server.'
  }
}

async function loadUsers(): Promise<void> {
  if (!serverId.value) {
    return
  }
  isLoadingUsers.value = true
  try {
    const page = await fetchUsers(serverId.value)
    users.value = page.users
  } finally {
    isLoadingUsers.value = false
  }
}

async function loadGroups(): Promise<void> {
  if (!serverId.value) {
    return
  }
  isLoadingGroups.value = true
  try {
    const page = await fetchGroups(serverId.value)
    groups.value = page.groups
  } finally {
    isLoadingGroups.value = false
  }
}

async function handleCreateUser(input: CreateUserInput): Promise<void> {
  if (!serverId.value) {
    return
  }
  try {
    const user = await createUser(serverId.value, input)
    users.value = [...users.value, user]
  } catch {
    loadError.value = 'Failed to create user.'
  }
}

async function handleUpdateUser(userId: string, input: UpdateUserInput): Promise<void> {
  if (!serverId.value) {
    return
  }
  try {
    const updated = await updateUser(serverId.value, userId, input)
    users.value = users.value.map(user => (user.id === userId ? updated : user))
  } catch {
    loadError.value = 'Failed to update user.'
  }
}

async function handleDeleteUser(userId: string): Promise<void> {
  if (!serverId.value) {
    return
  }
  try {
    await deleteUser(serverId.value, userId)
    users.value = users.value.filter(user => user.id !== userId)
    groups.value = groups.value.map(group => ({
      ...group,
      members: (group.members ?? []).filter(m => m.value !== userId),
    }))
  } catch {
    loadError.value = 'Failed to delete user.'
  }
}

async function handleCreateGroup(input: CreateGroupInput): Promise<void> {
  if (!serverId.value) {
    return
  }
  try {
    await createGroup(serverId.value, input)
    await loadGroups()
  } catch {
    loadError.value = 'Failed to create group.'
  }
}

async function handleUpdateGroup(groupId: string, input: UpdateGroupInput): Promise<void> {
  if (!serverId.value) {
    return
  }
  try {
    await updateGroup(serverId.value, groupId, input)
    await loadGroups()
    await loadUsers()
  } catch {
    loadError.value = 'Failed to update group.'
  }
}

async function handleDeleteGroup(groupId: string): Promise<void> {
  if (!serverId.value) {
    return
  }
  try {
    await deleteGroup(serverId.value, groupId)
    groups.value = groups.value.filter(group => group.id !== groupId)
    await loadUsers()
  } catch {
    loadError.value = 'Failed to delete group.'
  }
}

onMounted(() => {
  if (serverId.value) {
    initServer()
  }
})

watch(
  () => route.params.id,
  newId => {
    serverId.value = newId as string | undefined
    server.value = null
    if (!pendingBearerToken) {
      bearerToken.value = null
    }
    pendingBearerToken = null
    users.value = []
    groups.value = []
    loadError.value = null
    if (serverId.value) {
      initServer()
    }
  },
)

function setActiveTab(tab: ActiveTab): void {
  activeTab.value = tab
}
</script>

<template>
  <div class="flex flex-col h-full gap-6">
    <!-- Landing page (no server yet) -->
    <ScimLanding
      v-if="!serverId"
      :is-creating="isCreating"
      :load-error="loadError"
      @create="handleCreateServer"
    />

    <!-- Server view -->
    <div v-else class="flex flex-col flex-1 gap-4 min-h-0">
      <ScimToolbar
        :server-name="server?.name ?? '…'"
        :scim-base-url="scimBaseUrl"
        :bearer-token="bearerToken"
        :is-creating="isCreating"
        :is-deleting="isDeleting"
        @create="handleCreateServer"
        @delete="handleDeleteServer"
      />

      <p v-if="loadError" class="text-sm text-error">{{ loadError }}</p>

      <!-- Tabs -->
      <div class="flex items-center gap-1 border-b border-border">
        <button
          v-for="tab in (['users', 'groups', 'api', 'compliance'] as ActiveTab[])"
          :key="tab"
          type="button"
          class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer"
          :class="activeTab === tab
            ? 'text-text-primary border-accent'
            : 'text-text-muted border-transparent hover:text-text-secondary'"
          @click="setActiveTab(tab)"
        >
          <span class="capitalize">{{ tab === 'api' ? 'API Docs' : tab === 'compliance' ? 'Compliance' : tab }}</span>
          <span
            v-if="tab === 'users'"
            class="ml-1.5 px-1.5 py-0.5 text-xs font-normal bg-surface-raised border border-border rounded"
          >{{ users.length }}</span>
          <span
            v-else-if="tab === 'groups'"
            class="ml-1.5 px-1.5 py-0.5 text-xs font-normal bg-surface-raised border border-border rounded"
          >{{ groups.length }}</span>
        </button>
      </div>

      <!-- Tab panels (flex-1 + overflow so they scroll independently) -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <ScimUserList
          v-if="activeTab === 'users'"
          :users="users"
          :groups="groups"
          :is-loading="isLoadingUsers"
          @create-user="handleCreateUser"
          @update-user="handleUpdateUser"
          @delete-user="handleDeleteUser"
        />

        <ScimGroupList
          v-else-if="activeTab === 'groups'"
          :groups="groups"
          :users="users"
          :is-loading="isLoadingGroups"
          @create-group="handleCreateGroup"
          @update-group="handleUpdateGroup"
          @delete-group="handleDeleteGroup"
        />

        <ScimApiDocs
          v-else-if="activeTab === 'api'"
          :server-id="serverId ?? ''"
          :scim-base-url="scimBaseUrl"
          :bearer-token="bearerToken"
        />

        <ScimCompliance v-else-if="activeTab === 'compliance'" />
      </div>
    </div>
  </div>
</template>
