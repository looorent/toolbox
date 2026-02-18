<script setup lang="ts">
import CopyCodeRow from '@components/CopyCodeRow.vue'
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

function handleScanFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    processFile(file)
  }
}
</script>

<template>
  <div class="space-y-5">
    <label class="block">
      <span class="text-sm text-text-secondary">Upload an image containing a QR code</span>
      <input
        type="file"
        accept="image/*"
        class="mt-2 block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:bg-accent-hover file:cursor-pointer file:transition-colors"
        @change="handleScanFile"
      />
    </label>

    <p v-if="scanLoading" class="text-sm text-text-muted">Scanning...</p>

    <p v-if="scanError" class="text-sm text-error">{{ scanError }}</p>

    <CopyCodeRow v-if="scanResult" :value="scanResult" />
  </div>
</template>
