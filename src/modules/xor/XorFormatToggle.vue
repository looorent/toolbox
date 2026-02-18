<script setup lang="ts">
import type { XorInputFormat } from './types'

defineProps<{ modelValue: XorInputFormat }>()
const emit = defineEmits<{ 'update:modelValue': [format: XorInputFormat] }>()

const formats: XorInputFormat[] = ['hex', 'ascii']

function formatLabel(format: XorInputFormat): string {
  switch (format) {
    case 'hex':
      return 'Hex'
    case 'ascii':
      return 'ASCII'
    default:
      throw new Error(`Wrong XOR input format: '${format}'`)
  }
}
</script>

<template>
  <div class="flex gap-2">
    <button
      v-for="format in formats"
      :key="format"
      type="button"
      @click="emit('update:modelValue', format)"
      class="px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer"
      :class="modelValue === format
        ? 'bg-accent text-white'
        : 'bg-surface-overlay text-text-secondary border border-border hover:text-text-primary'"
    >
      {{ formatLabel(format) }}
    </button>
  </div>
</template>
