<script setup lang="ts">
import CopyButton from '@components/CopyButton.vue'
import CopyStatCard from '@components/CopyStatCard.vue'
import { computed, ref, watch } from 'vue'
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
  <div class="space-y-6">
    <p class="text-sm text-text-secondary">Paste a Base64-encoded image (raw or data URI) to preview it.</p>

    <div>
      <label class="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Base64 Image Data</label>
      <textarea
        v-model="input"
        placeholder="data:image/png;base64,iVBORw0KGgo... or raw base64"
        rows="4"
        class="w-full bg-surface-overlay border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none transition-colors resize-y"
        :class="error ? 'border-error' : 'border-border focus:border-border-focus'"
      />
      <p v-if="error" class="mt-1 text-xs text-error">Could not render image — check your Base64 string.</p>
    </div>

    <div v-if="dataUri" class="space-y-4">
      <div class="bg-surface-overlay border border-border rounded-lg p-4 flex items-center justify-center min-h-50">
        <div class="rounded" style="background-image: repeating-conic-gradient(#1a1d2e 0% 25%, #242842 0% 50%); background-size: 16px 16px;">
          <img :src="dataUri" alt="Preview" class="max-w-full max-h-100 block" />
        </div>
      </div>

      <div v-if="meta" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CopyStatCard title="Format" :value="meta.format" />
        <CopyStatCard title="Dimensions" :value="`${meta.width} × ${meta.height}`" />
        <CopyStatCard title="Size" :value="formatBytes(meta.byteSize)" />
        <CopyStatCard title="Base64 Length" :value="`${rawBase64.length.toLocaleString()} chars`" />
      </div>

      <div class="flex items-center gap-3">
        <CopyButton :value="dataUri ?? ''" label="Copy Data URI" />
        <CopyButton :value="rawBase64" label="Copy Raw Base64" />
        <button
          type="button"
          class="px-2 py-1 text-[10px] rounded text-text-muted hover:text-text-primary transition-colors"
          @click="download"
        >
          Download
        </button>
      </div>
    </div>
  </div>
</template>
