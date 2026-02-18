<script setup lang="ts">
import type { WiegandMode } from './types'

defineProps<{ modelValue: WiegandMode }>()
const emit = defineEmits<{ 'update:modelValue': [mode: WiegandMode] }>()

interface ModeOption {
  value: WiegandMode
  label: string
}

const options: ModeOption[] = [
  { value: 'encode', label: 'Plate \u2192 Wiegand' },
  { value: 'decode26', label: 'Decode W26' },
  { value: 'decode64', label: 'Decode W64' },
]
</script>

<template>
  <div class="flex gap-2">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer"
      :class="modelValue === option.value
        ? 'bg-accent text-white'
        : 'bg-surface-overlay text-text-secondary border border-border hover:text-text-primary'"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
