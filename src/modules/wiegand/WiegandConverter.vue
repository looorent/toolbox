<script setup lang="ts">
import { ref, watch } from 'vue'
import { processWiegand } from './logic'
import type { WiegandMode, WiegandResult } from './types'
import WiegandModeToggle from './WiegandModeToggle.vue'
import WiegandResultDisplay from './WiegandResultDisplay.vue'

const mode = ref<WiegandMode>('encode')
const input = ref<string>('')
const result = ref<WiegandResult | null>(null)

const modeConfig: Record<WiegandMode, { label: string; placeholder: string }> = {
  encode: { label: 'License plate (max 10 chars)', placeholder: 'e.g. ABC 123' },
  decode26: { label: 'Wiegand 26-bit hex (e.g. 1A98B4B)', placeholder: 'e.g. 1A98B4B' },
  decode64: { label: 'Wiegand 64-bit hex (16 chars)', placeholder: 'e.g. 6000011C1FBD3615' },
}

function clear(): void {
  input.value = ''
  result.value = null
}

async function convert(): Promise<void> {
  result.value = await processWiegand(mode.value, input.value)
}

watch(input, convert)
watch(mode, clear)
</script>

<template>
  <div class="space-y-6">
    <WiegandModeToggle v-model="mode" />

    <div>
      <label class="block text-sm text-text-secondary mb-2">
        {{ modeConfig[mode].label }}
      </label>
      <input
        v-model="input"
        :placeholder="modeConfig[mode].placeholder"
        class="w-full bg-surface-overlay border border-border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition-colors"
      />
    </div>

    <WiegandResultDisplay v-if="result" :result="result" />
  </div>
</template>
