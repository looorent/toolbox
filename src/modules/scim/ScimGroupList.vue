<script setup lang="ts">
import { TbButton, TbCopyId, TbInput } from '@components'
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

const showCreateForm = ref(false)
const expandedGroupId = ref<string | null>(null)

const createForm = ref<CreateGroupInput>({ displayName: '', externalId: '', memberIds: [] })
const editForm = ref<UpdateGroupInput & { memberIds: string[] }>({ displayName: '', externalId: '', memberIds: [] })

function openCreateForm(): void {
  createForm.value = { displayName: '', externalId: '', memberIds: [] }
  showCreateForm.value = true
  expandedGroupId.value = null
}

function toggleExpand(group: ScimGroup): void {
  if (expandedGroupId.value === group.id) {
    expandedGroupId.value = null
  } else {
    editForm.value = {
      displayName: group.displayName,
      externalId: group.externalId ?? '',
      memberIds: (group.members ?? []).map(m => m.value),
    }
    expandedGroupId.value = group.id
    showCreateForm.value = false
  }
}

function cancelForms(): void {
  showCreateForm.value = false
  expandedGroupId.value = null
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
  expandedGroupId.value = null
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
</script>

<template>
  <div class="tb-stack-4">
    <div class="tb-row tb-row--between">
      <h2 class="tb-section-title">
        Groups
        <span class="tb-badge tb-ml-3">{{ groups.length }}</span>
      </h2>
      <TbButton
        variant="secondary"
        size="sm"
        @click="openCreateForm"
      >
        + Add Group
      </TbButton>
    </div>

    <!-- Create form -->
    <div v-if="showCreateForm" class="tb-card--accent">
      <div class="tb-row tb-row--between tb-mb-6">
        <h3 class="tb-section-subtitle">New Group</h3>
        <div class="tb-row tb-row--gap-2">
          <TbButton variant="primary" size="sm" @click="submitCreate">Create</TbButton>
          <TbButton variant="secondary" size="sm" @click="cancelForms">Cancel</TbButton>
        </div>
      </div>
      <div class="tb-kv-table tb-kv-table--form">
        <div class="tb-kv-table__row">
          <span class="tb-kv-table__key">Name <span class="tb-text-error">*</span></span>
          <div class="tb-kv-table__value">
            <TbInput v-model="createForm.displayName" placeholder="Engineering" @keydown.enter="submitCreate" @keydown.esc="cancelForms" />
          </div>
        </div>
        <div class="tb-kv-table__row">
          <span class="tb-kv-table__key">External ID</span>
          <div class="tb-kv-table__value">
            <TbInput v-model="createForm.externalId" class="tb-font-mono" placeholder="ext-456" />
          </div>
        </div>
        <div v-if="users.length > 0" class="tb-kv-table__row tb-kv-table__row--top">
          <span class="tb-kv-table__key">Members</span>
          <div class="tb-kv-table__value tb-kv-table__value--padded">
            <div class="tb-row tb-row--gap-3 tb-row--wrap tb-max-h-32 tb-overflow-y-auto">
              <button
                v-for="user in users"
                :key="user.id"
                type="button"
                class="tb-chip"
                :class="(createForm.memberIds ?? []).includes(user.id) ? 'tb-chip--active' : ''"
                @click="toggleMemberInCreate(user.id)"
              >
                {{ user.userName }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="tb-empty-text">Loading groups…</div>

    <!-- Empty state -->
    <div v-else-if="groups.length === 0 && !showCreateForm" class="tb-empty-text">
      No groups yet. Click "Add Group" to create the first one.
    </div>

    <!-- Group list -->
    <div v-else class="tb-stack-1">
      <div
        v-for="group in groups"
        :key="group.id"
        class="tb-expandable"
      >
        <!-- Group row (expandable header) -->
        <div class="tb-group tb-expandable__header" @click="toggleExpand(group)">
          <svg
            class="tb-icon-md tb-chevron"
            :class="{ 'tb-chevron--open': expandedGroupId === group.id }"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <div class="tb-flex-fill tb-row tb-row--gap-2">
            <span class="tb-text-sm tb-font-medium tb-text-primary">{{ group.displayName }}</span>
            <span class="tb-hint">{{ group.members?.length ?? 0 }} member{{ (group.members?.length ?? 0) !== 1 ? 's' : '' }}</span>
            <TbCopyId :value="group.id" />
          </div>
          <button
            type="button"
            class="tb-btn-icon tb-btn-icon--danger tb-flex-shrink-0 tb-group-hover-visible"
            aria-label="Delete group"
            @click.stop="emit('deleteGroup', group.id)"
          >
            <svg class="tb-icon-sm" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <!-- Edit form (expandable body) -->
        <div v-if="expandedGroupId === group.id" class="tb-expandable__body">
          <div class="tb-row tb-row--between tb-mb-6">
            <span class="tb-hint">Edit fields and save</span>
            <div class="tb-row tb-row--gap-2">
              <TbButton variant="primary" size="sm" @click="submitEdit(group.id)">Save</TbButton>
              <TbButton variant="secondary" size="sm" @click="cancelForms">Cancel</TbButton>
            </div>
          </div>
          <div class="tb-kv-table tb-kv-table--form">
            <div class="tb-kv-table__row">
              <span class="tb-kv-table__key">Name <span class="tb-text-error">*</span></span>
              <div class="tb-kv-table__value">
                <TbInput v-model="editForm.displayName" @keydown.esc="cancelForms" />
              </div>
            </div>
            <div class="tb-kv-table__row">
              <span class="tb-kv-table__key">External ID</span>
              <div class="tb-kv-table__value">
                <TbInput v-model="editForm.externalId" class="tb-font-mono" />
              </div>
            </div>
            <div v-if="users.length > 0" class="tb-kv-table__row tb-kv-table__row--top">
              <span class="tb-kv-table__key">Members</span>
              <div class="tb-kv-table__value tb-kv-table__value--padded">
                <div class="tb-row tb-row--gap-3 tb-row--wrap tb-max-h-32 tb-overflow-y-auto">
                  <button
                    v-for="user in users"
                    :key="user.id"
                    type="button"
                    class="tb-chip"
                    :class="editForm.memberIds.includes(user.id) ? 'tb-chip--active' : ''"
                    @click="toggleMemberInEdit(user.id)"
                  >
                    {{ user.userName }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
