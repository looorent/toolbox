<script setup lang="ts">
import { TbButton, TbInput } from '@components'
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
</template>