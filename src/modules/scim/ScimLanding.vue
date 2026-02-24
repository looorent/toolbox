<script setup lang="ts">
defineProps<{
  isCreating: boolean
  loadError: string | null
}>()

const emit = defineEmits<{
  create: [prepopulate: boolean]
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-1 gap-8 text-center py-12">
    <div class="flex flex-col items-center gap-4">
      <div class="w-16 h-16 rounded-2xl bg-surface-raised border border-border flex items-center justify-center">
        <svg class="w-8 h-8 text-accent" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
      <div>
        <h2 class="text-xl font-semibold text-text-primary">SCIM Server</h2>
        <p class="mt-1 text-sm text-text-secondary max-w-md">
          Create an isolated SCIM 2.0 endpoint to provision users and groups. Each server gets a unique URL for identity provider integration.
        </p>
      </div>
    </div>

    <div class="flex flex-col items-center gap-3 w-full max-w-xs">
      <button
        type="button"
        class="w-full px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        :disabled="isCreating"
        @click="emit('create', false)"
      >
        {{ isCreating ? 'Creating…' : 'Create Empty Server' }}
      </button>
      <button
        type="button"
        class="w-full px-4 py-2.5 rounded-lg bg-surface-raised border border-border text-text-primary text-sm font-medium hover:border-border-focus transition-colors disabled:opacity-50 cursor-pointer"
        :disabled="isCreating"
        @click="emit('create', true)"
      >
        Create with Sample Data
      </button>
    </div>

    <p v-if="loadError" class="text-sm text-error">{{ loadError }}</p>

    <div class="text-xs text-text-muted max-w-sm">
      <p>If you already have a server URL, paste the ID into the address bar: <span class="font-mono text-text-secondary">/scim/&lt;id&gt;</span></p>
    </div>
  </div>
</template>
