<script setup lang="ts">
import { useCopy } from '@composables/useCopy'

const props = withDefaults(defineProps<{
  value: string
  truncate?: number
}>(), {
  truncate: 8,
})

const { copy, copied } = useCopy()
</script>

<template>
  <button
    type="button"
    class="tb-copy-id"
    :class="copied ? 'tb-copy-id--copied' : 'tb-copy-id--default'"
    :title="props.value"
    @click.stop="copy(props.value)"
  >
    <span role="status">{{ copied ? 'copied!' : `${props.value.slice(0, props.truncate)}…` }}</span>
    <svg v-if="!copied" class="tb-icon-xs tb-flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  </button>
</template>