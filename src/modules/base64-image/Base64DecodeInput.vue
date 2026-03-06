<script setup lang="ts">
import { TbButton, TbFieldInput } from '@components'
import { ref, watch } from 'vue'
import { exampleImageDataUri } from './exampleImage'
import { toDataUri } from './logic'

const input = ref('')
const error = ref(false)

const emit = defineEmits<{
  result: [dataUri: string | null]
}>()

watch(input, newInput => {
  const trimmed = newInput.trim()
  if (!trimmed) {
    error.value = false
    emit('result', null)
  } else {
    const uri = toDataUri(trimmed)
    if (uri) {
      error.value = false
      emit('result', uri)
    } else {
      error.value = true
      emit('result', null)
    }
  }
})

function loadSample(): void {
  input.value = exampleImageDataUri
}

defineExpose({ reset() { input.value = '' } })
</script>

<template>
  <TbFieldInput
    v-model="input"
    label="Base64 Image Data"
    multiline
    :rows="4"
    placeholder="data:image/png;base64,iVBORw0KGgo... or raw base64"
    :error="error"
    error-message="Could not render image — check your Base64 string."
  >
    <template #actions>
      <TbButton v-if="!input.trim()" variant="secondary" size="sm" @click="loadSample">Load sample</TbButton>
    </template>
  </TbFieldInput>
</template>
