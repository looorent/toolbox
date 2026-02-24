<script setup lang="ts">
import { useCopy } from '@composables/useCopy'
import { ref } from 'vue'
import type { CreateGroupInput, ScimGroup, ScimUser, UpdateGroupInput } from './types'

const props = defineProps<{
  groups: ScimGroup[]
  users: ScimUser[]
  isLoading: boolean
}>()

const emit = defineEmits<{
  createGroup: [input: CreateGroupInput]
  updateGroup: [groupId: string, input: UpdateGroupInput]
  deleteGroup: [groupId: string]
}>()

const { copy, copiedKey } = useCopy()

const showCreateForm = ref(false)
const editingGroupId = ref<string | null>(null)
const expandedGroupId = ref<string | null>(null)

const createForm = ref<CreateGroupInput>({ displayName: '', externalId: '', memberIds: [] })
const editForm = ref<UpdateGroupInput & { memberIds: string[] }>({ displayName: '', externalId: '', memberIds: [] })

function openCreateForm(): void {
  createForm.value = { displayName: '', externalId: '', memberIds: [] }
  showCreateForm.value = true
  editingGroupId.value = null
}

function openEditForm(group: ScimGroup): void {
  editForm.value = {
    displayName: group.displayName,
    externalId: group.externalId ?? '',
    memberIds: (group.members ?? []).map(m => m.value),
  }
  editingGroupId.value = group.id
  showCreateForm.value = false
}

function cancelForms(): void {
  showCreateForm.value = false
  editingGroupId.value = null
}

function submitCreate(): void {
  if (!createForm.value.displayName?.trim()) {
    return
  }
  emit('createGroup', { ...createForm.value })
  showCreateForm.value = false
}

function submitEdit(groupId: string): void {
  emit('updateGroup', groupId, { ...editForm.value })
  editingGroupId.value = null
}

function toggleExpand(groupId: string): void {
  expandedGroupId.value = expandedGroupId.value === groupId ? null : groupId
}

function toggleMemberInCreate(userId: string): void {
  const ids = createForm.value.memberIds ?? []
  if (ids.includes(userId)) {
    createForm.value.memberIds = ids.filter(id => id !== userId)
  } else {
    createForm.value.memberIds = [...ids, userId]
  }
}

function toggleMemberInEdit(userId: string): void {
  if (editForm.value.memberIds.includes(userId)) {
    editForm.value.memberIds = editForm.value.memberIds.filter(id => id !== userId)
  } else {
    editForm.value.memberIds = [...editForm.value.memberIds, userId]
  }
}

function getUserName(userId: string): string {
  return props.users.find(u => u.id === userId)?.userName ?? userId
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-text-primary">
        Groups
        <span class="ml-1.5 px-1.5 py-0.5 text-xs font-normal bg-surface-raised border border-border rounded text-text-muted">{{ groups.length }}</span>
      </h2>
      <button
        type="button"
        class="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors cursor-pointer"
        @click="openCreateForm"
      >
        + Add Group
      </button>
    </div>

    <!-- Create form -->
    <div v-if="showCreateForm" class="p-4 bg-surface-raised rounded-lg border border-accent/30">
      <h3 class="text-xs font-semibold text-text-primary mb-3">New Group</h3>
      <div class="flex flex-col gap-3">
        <div>
          <label class="block text-xs text-text-muted mb-1">Display Name <span class="text-error">*</span></label>
          <input
            v-model="createForm.displayName"
            class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="Engineering"
            @keydown.esc="cancelForms"
          />
        </div>
        <div>
          <label class="block text-xs text-text-muted mb-1">External ID</label>
          <input
            v-model="createForm.externalId"
            class="w-full px-2.5 py-1.5 text-xs font-mono bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary placeholder-text-muted"
            placeholder="ext-456"
          />
        </div>
        <div v-if="users.length > 0">
          <label class="block text-xs text-text-muted mb-1.5">Members</label>
          <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            <button
              v-for="user in users"
              :key="user.id"
              type="button"
              class="px-2 py-1 text-xs rounded-full border transition-colors cursor-pointer"
              :class="(createForm.memberIds ?? []).includes(user.id)
                ? 'bg-accent/15 border-accent/30 text-accent'
                : 'bg-surface border-border text-text-muted hover:border-border-focus hover:text-text-secondary'"
              @click="toggleMemberInCreate(user.id)"
            >
              {{ user.userName }}
            </button>
          </div>
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
    <div v-if="isLoading" class="text-center py-8 text-text-muted text-xs">Loading groups…</div>

    <!-- Empty state -->
    <div v-else-if="groups.length === 0 && !showCreateForm" class="text-center py-8 text-text-muted text-xs">
      No groups yet. Click "Add Group" to create the first one.
    </div>

    <!-- Group list -->
    <div v-else class="flex flex-col gap-1">
      <div
        v-for="group in groups"
        :key="group.id"
        class="rounded-lg border border-border bg-surface-raised overflow-hidden"
      >
        <!-- Edit form -->
        <div v-if="editingGroupId === group.id" class="p-4">
          <h3 class="text-xs font-semibold text-text-primary mb-3">Edit Group</h3>
          <div class="flex flex-col gap-3">
            <div>
              <label class="block text-xs text-text-muted mb-1">Display Name <span class="text-error">*</span></label>
              <input
                v-model="editForm.displayName"
                class="w-full px-2.5 py-1.5 text-xs bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary"
                @keydown.esc="cancelForms"
              />
            </div>
            <div>
              <label class="block text-xs text-text-muted mb-1">External ID</label>
              <input
                v-model="editForm.externalId"
                class="w-full px-2.5 py-1.5 text-xs font-mono bg-surface border border-border rounded focus:outline-none focus:border-border-focus text-text-primary"
              />
            </div>
            <div v-if="users.length > 0">
              <label class="block text-xs text-text-muted mb-1.5">Members</label>
              <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                <button
                  v-for="user in users"
                  :key="user.id"
                  type="button"
                  class="px-2 py-1 text-xs rounded-full border transition-colors cursor-pointer"
                  :class="editForm.memberIds.includes(user.id)
                    ? 'bg-accent/15 border-accent/30 text-accent'
                    : 'bg-surface border-border text-text-muted hover:border-border-focus hover:text-text-secondary'"
                  @click="toggleMemberInEdit(user.id)"
                >
                  {{ user.userName }}
                </button>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-3">
            <button
              type="button"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:opacity-90 transition-opacity cursor-pointer"
              @click="submitEdit(group.id)"
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

        <!-- Group row -->
        <div v-else>
          <div class="group flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              class="w-4 h-4 shrink-0 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              @click="toggleExpand(group.id)"
            >
              <svg
                class="w-4 h-4 transition-transform"
                :class="expandedGroupId === group.id ? 'rotate-90' : ''"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-medium text-text-primary">{{ group.displayName }}</span>
              <span class="ml-2 text-xs text-text-muted">{{ group.members?.length ?? 0 }} member{{ (group.members?.length ?? 0) !== 1 ? 's' : '' }}</span>
              <button
                type="button"
                class="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-mono text-xs transition-colors cursor-pointer"
                :class="copiedKey === group.id ? 'bg-success/10 border-success/20 text-success' : 'bg-surface border-border text-text-muted hover:border-border-focus hover:text-text-secondary'"
                :title="group.id"
                @click.stop="copy(group.id, group.id)"
              >
                <span>{{ copiedKey === group.id ? 'copied!' : `${group.id.slice(0, 8)}…` }}</span>
                <svg v-if="copiedKey !== group.id" class="w-3 h-3 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                type="button"
                class="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors cursor-pointer"
                title="Edit group"
                @click="openEditForm(group)"
              >
                <svg class="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                class="p-1.5 rounded text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                title="Delete group"
                @click="emit('deleteGroup', group.id)"
              >
                <svg class="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Expanded member list -->
          <div v-if="expandedGroupId === group.id && (group.members?.length ?? 0) > 0" class="px-4 pb-3 border-t border-border">
            <div class="flex flex-wrap gap-1.5 pt-3">
              <span
                v-for="member in group.members"
                :key="member.value"
                class="px-2 py-0.5 text-xs bg-surface border border-border rounded-full text-text-secondary"
              >
                {{ getUserName(member.value) }}
              </span>
            </div>
          </div>
          <div v-else-if="expandedGroupId === group.id" class="px-4 pb-3 border-t border-border">
            <p class="pt-3 text-xs text-text-muted">No members.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
