<script setup lang="ts">
import { useCopy } from '@composables/useCopy'

withDefaults(defineProps<{
  value: string
  label?: string
  labelCopied?: string
}>(), {
  label: 'click to copy',
  labelCopied: 'Copied!',
})

const { copy, copied } = useCopy()
</script>

<template>
  <div
    @click="copy(value)"
    class="group flex items-center justify-between bg-surface-overlay border border-border rounded-lg px-4 py-3 cursor-pointer active:opacity-80 hover:border-border-focus transition-colors"
  >
    <code class="text-sm font-mono text-text-primary select-all">{{ value }}</code>
    <span
      class="text-xs text-text-muted transition-opacity"
      :class="copied ? 'text-success opacity-100' : 'opacity-0 group-hover:opacity-100'"
    >
      {{ copied ? labelCopied : label }}
    </span>
  </div>
</template>
