<script setup lang="ts">
import { TbCopyRow, TbDropZone } from '@components'
import { ref } from 'vue'
import { scanQrFromFile } from './logic'

const scanResult = ref('')
const scanError = ref('')
const scanLoading = ref(false)

async function processFile(file: File) {
  scanResult.value = ''
  scanError.value = ''
  scanLoading.value = true

  try {
    const result = await scanQrFromFile(file)
    if (result) {
      scanResult.value = result.data
    } else {
      scanError.value = 'No QR code found in the image'
    }
  } catch (error) {
    scanError.value = error instanceof Error ? error.message : 'Failed to scan image'
  } finally {
    scanLoading.value = false
  }
}
</script>

<template>
  <div class="tb-stack-6">
    <TbDropZone accept="image/*" label="Drop an image here or click to browse" subtitle="Supports PNG, JPG, GIF, WebP, and BMP" @file="processFile" />

    <p v-if="scanLoading" role="status" class="tb-text-sm tb-text-muted">Scanning...</p>

    <p v-if="scanError" role="alert" class="tb-text-sm tb-text-error">{{ scanError }}</p>

    <TbCopyRow v-if="scanResult" :value="scanResult">
      <code class="tb-text-sm tb-font-mono tb-text-primary">{{ scanResult }}</code>
    </TbCopyRow>
  </div>
</template>
