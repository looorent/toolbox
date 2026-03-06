<script setup lang="ts">
import { TbButton, TbEmptyState } from '@components'

defineProps<{
  isCreating: boolean
  loadError: string | null
}>()

const emit = defineEmits<{
  create: [prepopulate: boolean]
}>()
</script>

<template>
  <TbEmptyState
    full
    title="SCIM Server"
    description="Create an isolated SCIM 2.0 endpoint to provision users and groups. Each server gets a unique URL for identity provider integration."
    :error="loadError"
  >
    <template #icon>
      <svg class="tb-icon-xl tb-text-accent" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </template>
    <TbButton :disabled="isCreating" @click="emit('create', false)">
      {{ isCreating ? 'Creating…' : 'Create Empty Server' }}
    </TbButton>
    <TbButton variant="secondary" :disabled="isCreating" @click="emit('create', true)">
      Create with Sample Data
    </TbButton>
    <p class="tb-hint">
      If you already have a server URL, paste the ID into the address bar: <span class="tb-font-mono tb-text-secondary">/scim/&lt;id&gt;</span>
    </p>
  </TbEmptyState>
</template>
