<script setup lang="ts">
import { useCopy } from '@composables/useCopy';

withDefaults(defineProps<{
  value: string
  label?: string
  labelCopied?: string
}>(), {
  label: 'Copy',
  labelCopied: 'Copied!',
})

const { copy, copied } = useCopy()
</script>

<template>
  <button
    type="button"
    class="px-2 py-1 text-[10px] rounded transition-colors"
    :class="copied ? 'text-success font-medium' : 'text-text-muted hover:text-text-primary'"
    @click="copy(value)"
  >
    {{ copied ? labelCopied : label }}
  </button>
</template>
