<script setup lang="ts">
import { TbDropZone, TbFieldInput } from '@components'
import { ref } from 'vue'
import { fileToDataUri } from './logic'

const error = ref(false)
const dataUri = ref<string | null>(null)

const emit = defineEmits<{
  result: [dataUri: string | null, fileName: string]
}>()

async function onFileDrop(file: File) {
  if (!file.type.startsWith('image/')) {
    error.value = true
    dataUri.value = null
    emit('result', null, '')
    return
  }

  error.value = false
  const uri = await fileToDataUri(file)
  dataUri.value = uri
  emit('result', uri, file.name)
}

defineExpose({
  reset() {
    error.value = false
    dataUri.value = null
  },
})
</script>

<template>
  <TbDropZone
    accept="image/*"
    label="Drop an image here or click to browse"
    subtitle="PNG, JPEG, GIF, WebP, SVG"
    @file="onFileDrop"
  />

  <div v-if="error" role="alert" class="tb-alert tb-alert--error">
    Selected file is not an image.
  </div>

  <TbFieldInput
    v-if="dataUri"
    :model-value="dataUri"
    label="Base64 Output"
    multiline
    :rows="4"
    readonly
    copyable
  />
</template>
