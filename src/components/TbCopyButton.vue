<script setup lang="ts">
import { useCopy } from '@composables/useCopy'

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
    class="tb-copy-button"
    :class="copied ? 'tb-copy-button--copied' : 'tb-copy-button--idle'"
    @click="copy(value)"
  >
    {{ copied ? labelCopied : label }}
  </button>
</template>
