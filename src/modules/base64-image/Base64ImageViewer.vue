<script setup lang="ts">
import { TbButton, TbCopyButton, TbFieldInput, TbStatCard } from '@components'
import { computed, ref, watch } from 'vue'
import { exampleImageDataUri } from './exampleImage'
import { base64ByteSize, extractBase64, formatBytes, toDataUri } from './logic'
import type { ImageMeta } from './types'

const input = ref('')
const dataUri = ref<string | null>(null)
const meta = ref<ImageMeta | null>(null)
const error = ref(false)

const rawBase64 = computed(() => extractBase64(input.value))

watch(input, newInput => {
  const trimmed = newInput.trim()
  if (!trimmed) {
    dataUri.value = null
    meta.value = null
    error.value = false
  } else {
    const uri = toDataUri(trimmed)
    if (!uri) {
      dataUri.value = null
      meta.value = null
      error.value = true
    } else {
      dataUri.value = uri
      error.value = false

      const mimeMatch = uri.match(/^data:(image\/[^;]+);/)
      const format = mimeMatch?.[1] ?? 'unknown'
      const byteSize = base64ByteSize(rawBase64.value)

      const img = new Image()
      img.onload = () => {
        meta.value = {
          format,
          width: img.naturalWidth,
          height: img.naturalHeight,
          byteSize,
          dataUri: uri,
        }
      }
      img.onerror = () => {
        meta.value = { format, width: 0, height: 0, byteSize, dataUri: uri }
        error.value = true
        dataUri.value = null
      }
      img.src = uri
    }
  }
})

function loadSample(): void {
  input.value = exampleImageDataUri
}

function download() {
  if (dataUri.value && meta.value) {
    const extension = meta.value.format.split('/')[1] || 'png'
    const link = document.createElement('a')
    link.href = dataUri.value
    link.download = `image.${extension}`
    link.click()
  }
}
</script>

<template>
  <div class="tb-stack-6">
    <p class="tb-text-description">Paste a Base64-encoded image (raw or data URI) to preview it.</p>

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

    <div v-if="dataUri" class="tb-stack-4">
      <div class="tb-card tb-flex-center tb-preview-panel">
        <div class="tb-checkerboard">
          <img :src="dataUri" alt="Preview" class="tb-img-contain tb-preview-media" />
        </div>
      </div>

      <div v-if="meta" class="tb-grid-4">
        <TbStatCard title="Format" :value="meta.format" />
        <TbStatCard title="Dimensions" :value="`${meta.width} × ${meta.height}`" />
        <TbStatCard title="Size" :value="formatBytes(meta.byteSize)" />
        <TbStatCard title="Base64 Length" :value="`${rawBase64.length.toLocaleString()} chars`" />
      </div>

      <div class="tb-row tb-row--gap-3">
        <TbButton size="sm" @click="download">Download</TbButton>
        <TbCopyButton :value="dataUri ?? ''" label="Copy Data URI" />
        <TbCopyButton :value="rawBase64" label="Copy Raw Base64" />
      </div>
    </div>
  </div>
</template>
