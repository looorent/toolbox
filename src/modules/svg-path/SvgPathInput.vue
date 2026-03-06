<script setup lang="ts">
import { TbButton, TbFieldInput } from '@components'

defineProps<{
  error: boolean
}>()

const pathData = defineModel<string>({ required: true })

const samplePath = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

function loadSample(): void {
  pathData.value = samplePath
}
</script>

<template>
  <TbFieldInput
    v-model="pathData"
    label="Path Data"
    multiline
    :rows="4"
    placeholder="M10 10 L90 10 L90 90 L10 90 Z"
    :error="error"
    error-message="Invalid path — must start with M/m and contain valid SVG path commands."
  >
    <template #actions>
      <TbButton v-if="!pathData.trim()" variant="secondary" size="sm" @click="loadSample">Load sample</TbButton>
    </template>
  </TbFieldInput>
</template>
