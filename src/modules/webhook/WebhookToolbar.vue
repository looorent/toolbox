<script setup lang="ts">
import { TbButton, TbCopyButton } from '@components'

defineProps<{
  webhookUrl: string
  isCreating: boolean
  isDeleting: boolean
  showSender: boolean
}>()

defineEmits<{
  create: []
  delete: []
  toggleSender: []
}>()
</script>

<template>
  <div class="tb-row tb-row--wrap">
    <div class="tb-info-bar tb-flex-fill">
      <span class="tb-code-inline tb-text-muted tb-flex-shrink-0">URL</span>
      <span class="tb-code-inline tb-text-primary tb-truncate">{{ webhookUrl }}</span>
    </div>
    <TbCopyButton :value="webhookUrl" label="Copy URL" label-copied="Copied!" />
    <TbButton
      variant="secondary"
      size="sm"
      :class="{ 'tb-btn-secondary--active': showSender }"
      @click="$emit('toggleSender')"
    >
      <svg class="tb-icon-sm" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
      Send
    </TbButton>
    <TbButton variant="secondary" size="sm" :disabled="isCreating" @click="$emit('create')">
      {{ isCreating ? 'Creating…' : 'New' }}
    </TbButton>
    <TbButton variant="danger" size="sm" :disabled="isDeleting" @click="$emit('delete')">
      {{ isDeleting ? 'Deleting…' : 'Delete' }}
    </TbButton>
  </div>
</template>
