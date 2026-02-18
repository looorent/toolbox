<script setup lang="ts">
import { useBidirectionalConverter } from '@composables/useBidirectionalConverter'
import { ref, watch } from 'vue'
import EntityTextArea from './EntityTextArea.vue'
import { decodeEntities, encodeEntities } from './logic'
import type { EntityFormat } from './types'

const format = ref<EntityFormat>('named')

const { left: decoded, right: encoded, recompute } = useBidirectionalConverter({
  forward: value => encodeEntities(value, format.value),
  backward: value => ({ value: decodeEntities(value), error: false }),
})

watch(format, recompute)

function selectFormat(value: EntityFormat): void {
  format.value = value
}

const FORMAT_OPTIONS: Array<{ value: EntityFormat; label: string }> = [
  { value: 'named', label: 'Named' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'hex', label: 'Hex' },
]
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-text-secondary">Encode and decode HTML entities. Type in either field.</p>

    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold uppercase tracking-wider text-text-muted">Format</span>
      <div class="flex rounded-lg border border-border overflow-hidden">
        <button
          v-for="formatOption in FORMAT_OPTIONS"
          :key="formatOption.value"
          type="button"
          class="px-3 py-1.5 text-xs font-medium transition-colors"
          :class="format === formatOption.value
            ? 'bg-accent text-white'
            : 'bg-surface-overlay text-text-secondary hover:text-text-primary'"
          @click="selectFormat(formatOption.value)"
        >
          {{ formatOption.label }}
        </button>
      </div>
    </div>

    <EntityTextArea
      v-model="decoded"
      label="Plain Text"
      placeholder='<div class="example">Hello & welcome</div>'
    />

    <EntityTextArea
      v-model="encoded"
      label="Encoded"
      placeholder="&lt;div class=&quot;example&quot;&gt;Hello &amp; welcome&lt;/div&gt;"
    />
  </div>
</template>
