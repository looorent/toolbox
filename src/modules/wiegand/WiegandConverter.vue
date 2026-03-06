<script setup lang="ts">
import { TbInput, TbOptionGroup, type TbOptionGroupOption } from '@components'
import { ref, watch } from 'vue'
import { processWiegand } from './logic'
import type { WiegandMode, WiegandResult } from './types'
import WiegandResultDisplay from './WiegandResultDisplay.vue'

const mode = ref<WiegandMode>('encode')
const input = ref<string>('')
const result = ref<WiegandResult | null>(null)

const modes: TbOptionGroupOption[] = [
  { value: 'encode', label: 'Plate → Wiegand' },
  { value: 'decode26', label: 'Decode W26' },
  { value: 'decode64', label: 'Decode W64' },
]

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
  <div class="tb-stack-6">

    <TbOptionGroup v-model="mode" :options="modes" />

    <div>
      <label class="tb-label">
        {{ modeConfig[mode].label }}
      </label>
      <TbInput v-model="input" :placeholder="modeConfig[mode].placeholder" />
    </div>

    <WiegandResultDisplay v-if="result" :result="result" />
  </div>
</template>
