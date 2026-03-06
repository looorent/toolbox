<script setup lang="ts">
import { TbFieldInput } from '@components'
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
  <div class="tb-stack-6">
    <XorFormatToggle v-model="inputFormat" />

    <TbFieldInput
      v-model="input"
      :label="inputFormat === 'hex' ? 'Hex bytes (e.g. 4A 3B 2C or 4A3B2C)' : 'ASCII string'"
      multiline
      :rows="3"
      :placeholder="inputFormat === 'hex' ? '4A 3B 2C 1D' : 'Hello World'"
    />

    <template v-if="result">
      <XorResultDisplay :result="result" />
    </template>
  </div>
</template>
