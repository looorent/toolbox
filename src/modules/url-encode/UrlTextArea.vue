<script setup lang="ts">
import CopyButton from '@components/CopyButton.vue'

defineProps<{
  label: string
  placeholder: string
  error?: boolean
  errorMessage?: string
}>()

const modelValue = defineModel<string>({ required: true })
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <label class="text-xs font-semibold uppercase tracking-wider text-text-muted">{{ label }}</label>
      <CopyButton v-if="modelValue" :value="modelValue" />
    </div>
    <textarea
      v-model="modelValue"
      :placeholder="placeholder"
      rows="4"
      class="w-full bg-surface-overlay border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none transition-colors resize-y"
      :class="error ? 'border-error' : 'border-border focus:border-border-focus'"
    />
    <p v-if="error && errorMessage" class="mt-1 text-xs text-error">{{ errorMessage }}</p>
  </div>
</template>
