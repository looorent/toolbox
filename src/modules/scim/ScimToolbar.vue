<script setup lang="ts">
import { TbButton, TbCopyButton } from '@components'
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
  <div class="tb-stack-3">
    <div class="tb-row tb-row--between tb-row--gap-4">
      <div class="tb-row tb-min-w-0">
        <div class="tb-icon-badge">
          <svg class="tb-icon-md tb-text-accent" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
        <div class="tb-min-w-0">
          <h1 class="tb-section-title tb-truncate">{{ serverName }}</h1>
          <p class="tb-hint">SCIM 2.0 Server</p>
        </div>
      </div>

      <div class="tb-row tb-flex-shrink-0">
        <TbButton
          variant="secondary"
          size="sm"
          :disabled="isCreating"
          @click="emit('create', false)"
        >
          New
        </TbButton>
        <TbButton
          variant="danger"
          size="sm"
          :disabled="isDeleting"
          @click="emit('delete')"
        >
          {{ isDeleting ? 'Deleting…' : 'Delete' }}
        </TbButton>
      </div>
    </div>

    <div class="tb-info-bar">
      <span class="tb-hint tb-flex-shrink-0">Base URL</span>
      <code class="tb-code-inline tb-text-secondary tb-truncate tb-flex-fill">{{ scimBaseUrl }}</code>
      <TbCopyButton :value="scimBaseUrl" class="tb-flex-shrink-0" />
    </div>

    <div v-if="bearerToken" class="tb-stack-3">
      <div class="tb-info-bar tb-info-bar--accent">
        <span class="tb-hint tb-flex-shrink-0">Bearer Token</span>
        <code class="tb-code-inline tb-text-secondary tb-truncate tb-flex-fill">{{ tokenVisible ? bearerToken : '••••••••••••••••••••••••••••••••••••' }}</code>
        <button
          type="button"
          class="tb-btn-icon"
          :aria-label="tokenVisible ? 'Hide token' : 'Show token'"
          @click="tokenVisible = !tokenVisible"
        >
          <svg v-if="tokenVisible" class="tb-icon-sm" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
          <svg v-else class="tb-icon-sm" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <TbCopyButton :value="bearerToken" class="tb-flex-shrink-0" />
      </div>
      <p class="tb-hint">Copy this token now — it won't be shown again.</p>
    </div>
  </div>
</template>
