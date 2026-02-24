<script setup lang="ts">
import CopyButton from '@components/CopyButton.vue'

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
  <div class="flex items-center gap-2 flex-wrap">
    <div class="flex-1 min-w-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-overlay border border-border text-sm truncate">
      <span class="text-text-muted shrink-0 font-mono text-xs">URL</span>
      <span class="font-mono text-text-primary truncate text-xs">{{ webhookUrl }}</span>
    </div>
    <CopyButton :value="webhookUrl" label="Copy URL" label-copied="Copied!" />
    <button
      type="button"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer"
      :class="showSender
        ? 'bg-accent/10 border-accent/30 text-accent'
        : 'bg-surface-overlay border-border text-text-secondary hover:text-text-primary hover:border-border-focus'"
      @click="$emit('toggleSender')"
    >
      <svg class="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
      Send
    </button>
    <button
      type="button"
      :disabled="isCreating"
      class="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-overlay border border-border text-text-secondary hover:text-text-primary hover:border-border-focus transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
      @click="$emit('create')"
    >
      {{ isCreating ? 'Creating…' : 'New' }}
    </button>
    <button
      type="button"
      :disabled="isDeleting"
      class="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-overlay border border-border text-error hover:border-error/40 transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
      @click="$emit('delete')"
    >
      {{ isDeleting ? 'Deleting…' : 'Delete' }}
    </button>
  </div>
</template>
