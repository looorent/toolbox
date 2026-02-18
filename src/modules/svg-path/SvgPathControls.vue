<script setup lang="ts">
import CopyButton from '@components/CopyButton.vue'

defineProps<{
  validPath: boolean
  svgString: string
}>()

const stroke = defineModel<string>('stroke', { required: true })
const fill = defineModel<string>('fill', { required: true })
const showGrid = defineModel<boolean>('showGrid', { required: true })
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <label class="flex items-center gap-2 text-xs text-text-secondary">
      <span class="font-semibold uppercase tracking-wider text-text-muted">Stroke</span>
      <input v-model="stroke" type="color" class="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
    </label>

    <label class="flex items-center gap-2 text-xs text-text-secondary">
      <span class="font-semibold uppercase tracking-wider text-text-muted">Fill</span>
      <select
        v-model="fill"
        class="bg-surface-overlay border border-border rounded px-2 py-1 text-xs font-mono text-text-primary focus:outline-none focus:border-border-focus"
      >
        <option value="none">none</option>
        <option :value="stroke">stroke color</option>
        <option value="currentColor">currentColor</option>
      </select>
    </label>

    <label class="flex items-center gap-2 text-xs cursor-pointer">
      <input v-model="showGrid" type="checkbox" class="accent-accent" />
      <span class="text-text-secondary">Grid</span>
    </label>

    <CopyButton v-if="validPath" :value="svgString" label="Copy SVG" class="ml-auto" />
  </div>
</template>
