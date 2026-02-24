<script setup lang="ts">
import CopyButton from '@components/CopyButton.vue'
import { ref } from 'vue'

defineProps<{
  serverName: string
  scimBaseUrl: string
  bearerToken: string | null
  isCreating: boolean
  isDeleting: boolean
}>()

const tokenVisible = ref(false)

const emit = defineEmits<{
  create: [prepopulate: boolean]
  delete: []
}>()
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-8 h-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-accent" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
        <div class="min-w-0">
          <h1 class="text-sm font-semibold text-text-primary truncate">{{ serverName }}</h1>
          <p class="text-xs text-text-muted">SCIM 2.0 Server</p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-raised border border-border text-text-secondary hover:border-border-focus hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
          :disabled="isCreating"
          @click="emit('create', false)"
        >
          New
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium rounded-lg bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-colors disabled:opacity-50 cursor-pointer"
          :disabled="isDeleting"
          @click="emit('delete')"
        >
          {{ isDeleting ? 'Deleting…' : 'Delete' }}
        </button>
      </div>
    </div>

    <div class="flex items-center gap-2 px-3 py-2 bg-surface-raised rounded-lg border border-border">
      <span class="text-xs text-text-muted shrink-0">Base URL</span>
      <code class="flex-1 text-xs font-mono text-text-secondary truncate">{{ scimBaseUrl }}</code>
      <CopyButton :value="scimBaseUrl" class="shrink-0" />
    </div>

    <div v-if="bearerToken" class="flex flex-col gap-1.5">
      <div class="flex items-center gap-2 px-3 py-2 bg-surface-raised rounded-lg border border-accent/30">
        <span class="text-xs text-text-muted shrink-0">Bearer Token</span>
        <code class="flex-1 text-xs font-mono text-text-secondary truncate">{{ tokenVisible ? bearerToken : '••••••••••••••••••••••••••••••••••••' }}</code>
        <button
          type="button"
          class="shrink-0 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
          :title="tokenVisible ? 'Hide token' : 'Show token'"
          @click="tokenVisible = !tokenVisible"
        >
          <svg v-if="tokenVisible" class="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
          <svg v-else class="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <CopyButton :value="bearerToken" class="shrink-0" />
      </div>
      <p class="text-xs text-text-muted px-1">Copy this token now — it won't be shown again.</p>
    </div>
  </div>
</template>
