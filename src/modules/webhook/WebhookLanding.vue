<script setup lang="ts">
defineProps<{
  isCreating: boolean
  loadError: string | null
}>()

defineEmits<{
  create: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-1 gap-8 px-4 py-12">
    <div class="text-center space-y-3 max-w-md">
      <h2 class="text-xl font-semibold text-text-primary">Webhook Catcher</h2>
      <p class="text-sm text-text-secondary">
        Generate a unique URL and inspect every HTTP request sent to it in real time.
        Requests are automatically purged after 30 days of inactivity.
      </p>
    </div>

    <button
      type="button"
      :disabled="isCreating"
      class="px-6 py-2.5 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
      @click="$emit('create')"
    >
      {{ isCreating ? 'Creating…' : 'Create New Webhook' }}
    </button>

    <p v-if="loadError" class="text-sm text-error">{{ loadError }}</p>
  </div>
</template>
