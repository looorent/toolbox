<script setup lang="ts">
import CopyButton from '@components/CopyButton.vue'

defineProps<{
  label: string
  placeholder: string
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
      class="w-full bg-surface-overlay border border-border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition-colors resize-y"
    />
  </div>
</template>
