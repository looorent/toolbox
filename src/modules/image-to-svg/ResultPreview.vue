<script setup lang="ts">
import { TbButton, TbCopyButton } from '@components'
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
  <div class="tb-stack-4">
    <div class="tb-row tb-row--gap-4 tb-row--wrap tb-hint">
      <span>{{ result.width }} x {{ result.height }}</span>
      <span>Original: {{ formatFileSize(originalFileSize) }}</span>
      <span>SVG: {{ formatFileSize(result.svgSize) }}</span>
    </div>

    <div class="tb-row tb-row--gap-2">
      <TbButton size="sm" @click="downloadSvg">Download SVG</TbButton>
      <TbCopyButton :value="outputSvg" label="Copy SVG" />
    </div>

    <!-- Side-by-side preview -->
    <div class="tb-grid-2 tb-gap-8">
      <div>
        <label class="tb-label">Original</label>
        <div class="tb-card tb-flex-center tb-preview-panel">
          <img
            :src="imagePreviewUrl"
            alt="Original"
            class="tb-img-contain tb-preview-media"
          >
        </div>
      </div>
      <div>
        <label class="tb-label">SVG</label>
        <div
          class="tb-card tb-flex-center tb-preview-panel"
          v-html="outputSvg"
        />
      </div>
    </div>
  </div>
</template>
