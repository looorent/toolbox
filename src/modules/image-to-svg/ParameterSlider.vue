<script setup lang="ts">
defineProps<{
  label: string
  min: number
  max: number
  step: number
  description: string
  disabled?: boolean
}>()

const value = defineModel<number>({ required: true })
</script>

<template>
  <div class="space-y-1">
    <div class="flex items-center justify-between">
      <label class="text-xs font-medium text-text-secondary">{{ label }}</label>
      <span class="text-xs font-mono text-text-muted">{{ value }}</span>
    </div>
    <input
      v-model.number="value"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      class="w-full accent-accent"
    >
    <p class="text-[10px] text-text-muted leading-tight">{{ description }}</p>
  </div>
</template>
