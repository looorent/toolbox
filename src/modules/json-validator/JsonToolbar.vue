<script setup lang="ts">
import { useCopy } from '@composables/useCopy'
import type { JsonValidationResult } from './types'

const props = defineProps<{
  result: JsonValidationResult
}>()

const emit = defineEmits<{
  format: []
  minify: []
  loadSample: []
}>()

const { copy, copiedKey } = useCopy()

function copyFormatted() {
  if (props.result.kind === 'valid') {
    copy('json', props.result.formatted)
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <template v-if="result.kind === 'valid'">
      <button
        type="button"
        class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-overlay text-text-secondary hover:text-text-primary border border-border transition-colors"
        @click="emit('format')"
      >
        Prettify
      </button>
      <button
        type="button"
        class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-overlay text-text-secondary hover:text-text-primary border border-border transition-colors"
        @click="emit('minify')"
      >
        Minify
      </button>
      <button
        type="button"
        class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
        :class="copiedKey === 'json' ? 'bg-success/20 text-success' : 'bg-surface-overlay text-text-secondary hover:text-text-primary border border-border'"
        @click="copyFormatted"
      >
        {{ copiedKey === 'json' ? 'Copied!' : 'Copy' }}
      </button>
    </template>

    <button
      v-if="result.kind === 'empty'"
      type="button"
      class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-overlay text-text-secondary hover:text-text-primary border border-border transition-colors"
      @click="emit('loadSample')"
    >
      Load sample
    </button>

    <span
      v-if="result.kind !== 'empty'"
      class="ml-auto px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full"
      :class="result.kind === 'valid' ? 'bg-success/15 text-success' : 'bg-error/15 text-error'"
    >
      {{ result.kind === 'valid' ? 'Valid JSON' : 'Invalid' }}
    </span>
  </div>
</template>
