<script setup lang="ts">
import { TbOptionGroup } from '@components'
import { ref, watch } from 'vue'
import Base64DecodeInput from './Base64DecodeInput.vue'
import Base64EncodeInput from './Base64EncodeInput.vue'
import Base64ImagePreview from './Base64ImagePreview.vue'
import { base64ByteSize, extractBase64 } from './logic'
import type { ImageMeta } from './types'

type Mode = 'decode' | 'encode'

const mode = ref<Mode>('decode')
const dataUri = ref<string | null>(null)
const meta = ref<ImageMeta | null>(null)
const fileName = ref('')

const decodeInput = ref<InstanceType<typeof Base64DecodeInput> | null>(null)
const encodeInput = ref<InstanceType<typeof Base64EncodeInput> | null>(null)

const modeOptions = [
  { value: 'decode', label: 'Base64 to Image' },
  { value: 'encode', label: 'Image to Base64' },
]

watch(mode, () => {
  dataUri.value = null
  meta.value = null
  fileName.value = ''
  decodeInput.value?.reset()
  encodeInput.value?.reset()
})

function loadImageMeta(uri: string) {
  const mimeMatch = uri.match(/^data:(image\/[^;]+);/)
  const format = mimeMatch?.[1] ?? 'unknown'
  const byteSize = base64ByteSize(extractBase64(uri))

  const img = new Image()
  img.onload = () => {
    meta.value = { format, width: img.naturalWidth, height: img.naturalHeight, byteSize, dataUri: uri }
  }
  img.onerror = () => {
    meta.value = { format, width: 0, height: 0, byteSize, dataUri: uri }
    dataUri.value = null
  }
  img.src = uri
}

function onResult(uri: string | null, name?: string) {
  dataUri.value = uri
  meta.value = null
  if (name !== undefined) {
    fileName.value = name
  }
  if (uri) {
    loadImageMeta(uri)
  }
}
</script>

<template>
  <div class="tb-stack-6">
    <p class="tb-text-description">Convert between images and Base64-encoded strings.</p>

    <TbOptionGroup v-model="mode" variant="segmented" label="Mode" :options="modeOptions" />

    <Base64DecodeInput v-if="mode === 'decode'" ref="decodeInput" @result="uri => onResult(uri)" />
    <Base64EncodeInput v-else ref="encodeInput" @result="onResult" />

    <Base64ImagePreview
      v-if="dataUri"
      :data-uri="dataUri"
      :meta="meta"
      :show-download="mode === 'decode'"
      :file-name="fileName"
    />
  </div>
</template>
