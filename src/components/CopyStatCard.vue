<script setup lang="ts">
import { useCopy } from '@composables/useCopy';

withDefaults(defineProps<{
  title: string
  value: string
  valueClass?: string
  labelCopied?: string
}>(), {
  valueClass: 'text-sm font-mono font-medium text-text-primary',
  labelCopied: 'Copied!',
})

const { copy, copied } = useCopy()
</script>

<template>
  <div
    class="bg-surface-overlay border border-border rounded-lg p-4 cursor-pointer active:opacity-80"
    @click="copy(value)"
  >
    <p class="text-xs text-text-muted uppercase tracking-wider mb-1">
      {{ title }}
      <span v-if="copied" class="text-success normal-case tracking-normal ml-1">{{ labelCopied }}</span>
    </p>
    <slot>
      <p :class="valueClass">{{ value }}</p>
    </slot>
  </div>
</template>
