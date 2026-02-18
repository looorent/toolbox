<script setup lang="ts">
import { ref, watch } from 'vue'
import { calculateXor } from './logic'
import type { XorInputFormat, XorResult } from './types'
import XorFormatToggle from './XorFormatToggle.vue'
import XorResultDisplay from './XorResultDisplay.vue'

const input = ref('')
const inputFormat = ref<XorInputFormat>('hex')
const result = ref<XorResult | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function computeResult() {
  result.value = calculateXor(input.value, inputFormat.value)
}

watch([input, inputFormat], () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(computeResult, 200)
})
</script>

<template>
  <div class="space-y-6">
    <XorFormatToggle v-model="inputFormat" />

    <div>
      <label class="block text-sm text-text-secondary mb-2">
        {{ inputFormat === 'hex' ? 'Hex bytes (e.g. 4A 3B 2C or 4A3B2C)' : 'ASCII string' }}
      </label>
      <textarea
        v-model="input"
        :placeholder="inputFormat === 'hex' ? '4A 3B 2C 1D' : 'Hello World'"
        rows="3"
        class="w-full bg-surface-overlay border border-border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition-colors resize-y"
      />
    </div>

    <template v-if="result">
      <XorResultDisplay :result="result" />
    </template>
  </div>
</template>
