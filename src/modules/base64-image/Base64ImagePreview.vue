<script setup lang="ts">
import { TbButton, TbCopyButton, TbStatCard } from '@components'
import { computed } from 'vue'
import { extractBase64, formatBytes } from './logic'
import type { ImageMeta } from './types'

const props = defineProps<{
  dataUri: string
  meta: ImageMeta | null
  showDownload: boolean
  fileName: string
}>()

const rawBase64 = computed(() => extractBase64(props.dataUri))

function download() {
  if (props.meta) {
    const extension = props.meta.format.split('/')[1] || 'png'
    const link = document.createElement('a')
    link.href = props.dataUri
    link.download = props.fileName || `image.${extension}`
    link.click()
  }
}
</script>

<template>
  <div class="tb-stack-4">
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
      <TbButton v-if="showDownload" size="sm" @click="download">Download</TbButton>
      <TbCopyButton :value="dataUri" label="Copy Data URI" />
      <TbCopyButton :value="rawBase64" label="Copy Raw Base64" />
    </div>
  </div>
</template>
