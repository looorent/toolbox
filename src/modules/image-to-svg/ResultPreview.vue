<script setup lang="ts">
import CopyButton from '@components/CopyButton.vue'
import { formatDateTimeCompact } from '@utils/formatDateTimeCompact'
import { formatFileSize } from '@utils/formatFileSize'
import { computed } from 'vue'
import type { ConversionResult } from './types'

const props = defineProps<{
  imagePreviewUrl: string
  result: ConversionResult
  originalFileName: string
  originalFileSize: number
}>()

const outputSvg = computed(() => props.result.svg)

function buildDownloadFilename(): string {
  const baseName = props.originalFileName.replace(/\.[^.]+$/, '')
  return `${formatDateTimeCompact()}_${baseName}.svg`
}

function downloadSvg() {
  const url = URL.createObjectURL(new Blob([outputSvg.value], { type: 'image/svg+xml' }))
  const link = document.createElement('a')
  link.href = url
  link.download = buildDownloadFilename()
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-4 text-xs text-text-muted">
      <span>{{ result.width }} x {{ result.height }}</span>
      <span>Original: {{ formatFileSize(originalFileSize) }}</span>
      <span>SVG: {{ formatFileSize(result.svgSize) }}</span>
    </div>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="px-3 py-1.5 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors cursor-pointer"
        @click="downloadSvg"
      >
        Download SVG
      </button>
      <CopyButton :value="outputSvg" label="Copy SVG" />
    </div>

    <!-- Side-by-side preview -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 block">Original</label>
        <div class="bg-surface-overlay border border-border rounded-lg p-4 flex items-center justify-center min-h-48">
          <img
            :src="imagePreviewUrl"
            alt="Original"
            class="max-w-full max-h-96 object-contain"
            style="image-rendering: auto;"
          >
        </div>
      </div>
      <div>
        <label class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 block">SVG</label>
        <div
          class="bg-surface-overlay border border-border rounded-lg p-4 flex items-center justify-center min-h-48"
          v-html="outputSvg"
        />
      </div>
    </div>
  </div>
</template>
