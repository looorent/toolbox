<script setup lang="ts">
import { useCopy } from '@composables/useCopy'

const props = defineProps<{
  uuids: string[]
}>()

const count = defineModel<number>('count', { required: true })
const emit = defineEmits<{ generate: [] }>()

const { copy, copied } = useCopy()

async function copyAll() {
  await copy(props.uuids.join('\n'))
}
</script>

<template>
  <div class="flex items-center gap-4">
    <div class="flex items-center gap-2">
      <label class="text-sm text-text-secondary">Count</label>
      <input
        v-model.number="count"
        type="number"
        min="1"
        max="100"
        class="w-20 bg-surface-overlay border border-border rounded-lg px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-border-focus transition-colors"
      />
    </div>

    <button
      type="button"
      @click="emit('generate')"
      class="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
    >
      Generate
    </button>

    <button
      v-if="uuids.length > 1"
      type="button"
      @click="copyAll"
      class="px-4 py-2 bg-surface-overlay hover:bg-border text-text-secondary text-sm font-medium rounded-lg border border-border transition-colors cursor-pointer"
    >
      {{ copied ? 'Copied!' : 'Copy All' }}
    </button>
  </div>
</template>
