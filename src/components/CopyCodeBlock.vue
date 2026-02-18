<script setup lang="ts">
import { useCopy } from '@composables/useCopy';

withDefaults(defineProps<{
  title: string
  value: string
  labelCopied?: string
}>(), {
  labelCopied: 'Copied!',
})

const { copy, copied } = useCopy()
</script>

<template>
  <div
    class="cursor-pointer active:opacity-80"
    @click="copy(value)"
  >
    <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
      {{ title }}
      <span v-if="copied" class="text-success normal-case tracking-normal ml-1">{{ labelCopied }}</span>
    </h3>
    <code class="block bg-surface-overlay border border-border rounded-lg px-4 py-3 text-sm font-mono text-text-secondary break-all">{{ value }}</code>
  </div>
</template>
