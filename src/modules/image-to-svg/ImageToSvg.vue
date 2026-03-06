<script setup lang="ts">
import { TbButton, TbDropZone, TbProgressBar } from '@components'
import { ref, watch } from 'vue'
import ConversionParameters from './ConversionParameters.vue'
import { convertToSvg, getDefaultParams, loadImageFromFile } from './logic'
import ResultPreview from './ResultPreview.vue'
import type { ConversionParams, ConversionResult } from './types'

const params = ref<ConversionParams>(getDefaultParams())
const image = ref<HTMLImageElement | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const originalFileName = ref('')
const originalFileSize = ref(0)
const result = ref<ConversionResult | null>(null)
const converting = ref(false)
const progress = ref(0)
const errorMessage = ref('')

let conversionGeneration = 0

async function handleFile(file: File) {
  errorMessage.value = ''
  result.value = null
  originalFileName.value = file.name
  originalFileSize.value = file.size

  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }

  imagePreviewUrl.value = URL.createObjectURL(file)

  try {
    image.value = await loadImageFromFile(file)
    await runConversion()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load image'
  }
}

async function runConversion() {
  if (image.value) {
    converting.value = true
    progress.value = 0
    errorMessage.value = ''

    const generation = ++conversionGeneration

    try {
      const conversionResult = await convertToSvg(image.value, params.value, progressValue => {
        if (generation === conversionGeneration) {
          progress.value = progressValue
        }
      })

      if (generation === conversionGeneration) {
        result.value = conversionResult
      }
    } catch (error) {
      if (generation === conversionGeneration) {
        errorMessage.value = error instanceof Error ? error.message : 'Conversion failed'
      }
    } finally {
      if (generation === conversionGeneration) {
        converting.value = false
      }
    }
  }
}

function clearImage() {
  conversionGeneration++

  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }

  image.value = null
  imagePreviewUrl.value = null
  originalFileName.value = ''
  originalFileSize.value = 0
  result.value = null
  converting.value = false
  progress.value = 0
  errorMessage.value = ''
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => ({ ...params.value }), () => {
  if (image.value) {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      debounceTimer = null
      runConversion()
    }, 500)
  }
})
</script>

<template>
  <div class="tb-stack-6">
    <p class="tb-text-description">Convert raster images (PNG, JPG) to SVG vector graphics using VTracer.</p>

    <TbDropZone accept="image/*" label="Drop an image here or click to browse" subtitle="Supports PNG, JPG, GIF, WebP, and BMP" @file="handleFile" />

    <p v-if="errorMessage" role="alert" class="tb-text-sm tb-text-error">{{ errorMessage }}</p>

    <ConversionParameters v-if="image" v-model="params" :disabled="converting" />

    <TbProgressBar v-if="converting" :progress="progress" label="Converting..." />

    <div v-if="image" class="tb-row tb-row--gap-2">
      <TbButton variant="secondary" size="sm" @click="clearImage">Clear</TbButton>
    </div>

    <ResultPreview
      v-if="imagePreviewUrl && result"
      :image-preview-url="imagePreviewUrl"
      :result="result"
      :original-file-name="originalFileName"
      :original-file-size="originalFileSize"
    />
  </div>
</template>
