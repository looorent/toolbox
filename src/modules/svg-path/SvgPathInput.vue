<script setup lang="ts">
defineProps<{
  error: boolean
}>()

const pathData = defineModel<string>({ required: true })
</script>

<template>
  <div>
    <label class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Path Data</label>
    <textarea
      v-model="pathData"
      placeholder="M10 10 L90 10 L90 90 L10 90 Z"
      rows="4"
      class="w-full bg-surface-overlay border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none transition-colors resize-y"
      :class="error ? 'border-error' : 'border-border focus:border-border-focus'"
    />
    <p v-if="error" class="mt-1 text-xs text-error">Invalid path — must start with M/m and contain valid SVG path commands.</p>
  </div>
</template>
