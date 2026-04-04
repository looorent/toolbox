<script setup lang="ts">
import { TbButton, TbInput, TbOptionGroup } from '@components'
import type { TbOptionGroupOption } from '@components'
import { useCopy } from '@composables/useCopy'
import type { UuidVersion } from './types'

const props = defineProps<{
  uuids: string[]
}>()

const count = defineModel<number>('count', { required: true })
const version = defineModel<UuidVersion>('version', { required: true })
const emit = defineEmits<{ generate: [] }>()

const { copy, copied } = useCopy()

const versionOptions: TbOptionGroupOption[] = [
  { value: 'v4', label: 'v4', description: 'Random — 122 bits of randomness' },
  { value: 'v7', label: 'v7', description: 'Time-ordered — 48-bit millisecond timestamp + random' },
]

async function copyAll() {
  await copy(props.uuids.join('\n'))
}
</script>

<template>
  <div class="tb-stack-4">
    <TbOptionGroup v-model="version" variant="segmented" label="UUID version" :options="versionOptions" @update:model-value="emit('generate')" />

    <div class="tb-row tb-row--gap-4">
      <div class="tb-row tb-row--gap-2">
        <label class="tb-text-description">Count</label>
        <TbInput v-model.number="count" type="number" min="1" max="100" class="tb-input--small tb-w-20" />
      </div>

      <TbButton @click="emit('generate')">Generate</TbButton>

      <TbButton
        v-if="uuids.length > 1"
        variant="secondary"
        @click="copyAll"
      >
        {{ copied ? 'Copied!' : 'Copy All' }}
      </TbButton>
    </div>
  </div>
</template>
