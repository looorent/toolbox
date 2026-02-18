<script setup lang="ts">
import CopyButton from '@components/CopyButton.vue'
import { ref, useTemplateRef, watch } from 'vue'
import { downloadCanvasAsPng, generateQrDataUri, generateQrToCanvas } from './logic'
import type { QrErrorCorrectionLevel } from './types'

const generatorText = ref('')
const errorCorrectionLevel = ref<QrErrorCorrectionLevel>('M')
const generatorSize = ref(300)
const generatorCanvas = useTemplateRef<HTMLCanvasElement>('generatorCanvas')
const generatorDataUri = ref('')
const generatorError = ref('')

const errorCorrectionLevels: QrErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']

watch([generatorText, errorCorrectionLevel, generatorSize], async () => {
  generatorError.value = ''
  generatorDataUri.value = ''

  if (!generatorText.value) {
    if (generatorCanvas.value) {
      const context = generatorCanvas.value.getContext('2d')
      if (context) {
        generatorCanvas.value.width = 0
        generatorCanvas.value.height = 0
      }
    }
  } else {
    try {
      const canvas = generatorCanvas.value
      if (canvas) {
        await generateQrToCanvas(canvas, generatorText.value, errorCorrectionLevel.value, generatorSize.value)
      }
      generatorDataUri.value = await generateQrDataUri(generatorText.value, errorCorrectionLevel.value, generatorSize.value)
    } catch (error) {
      console.error(`[QR Code Generator] Error when generating QR Code '${generatorText.value}' with correction level '${errorCorrectionLevel.value}' in size '${generatorSize.value}'.`, error)
      generatorError.value = error instanceof Error ? error.message : 'Failed to generate QR code'
    }
  }
})

function downloadGeneratorPng() {
  if (generatorCanvas.value) {
    downloadCanvasAsPng(generatorCanvas.value, 'qrcode.png')
  }
}

function changeCorrectionLevel(newLevel: QrErrorCorrectionLevel) {
  errorCorrectionLevel.value = newLevel
}
</script>

<template>
  <div class="space-y-5">
    <textarea
      v-model="generatorText"
      placeholder="Enter text or URL..."
      rows="3"
      class="w-full bg-surface-overlay border border-border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition-colors resize-y"
    />

    <div class="flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <label class="text-sm text-text-secondary">Error correction</label>
        <div class="flex gap-1">
          <button
            v-for="level in errorCorrectionLevels"
            :key="level"
            type="button"
            class="w-8 h-8 text-xs font-bold rounded-lg transition-colors"
            :class="errorCorrectionLevel === level
              ? 'bg-accent text-white'
              : 'bg-surface-overlay text-text-secondary hover:text-text-primary border border-border'"
            @click="changeCorrectionLevel(errorCorrectionLevel)"
          >
            {{ level }}
          </button>
        </div>
      </div>

      <!-- Size -->
      <div class="flex items-center gap-2">
        <label class="text-sm text-text-secondary">Size</label>
        <input
          v-model.number="generatorSize"
          type="number"
          min="100"
          max="1000"
          step="50"
          class="w-20 bg-surface-overlay border border-border rounded-lg px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-border-focus transition-colors"
        />
      </div>
    </div>

    <p v-if="generatorError" class="text-sm text-error">{{ generatorError }}</p>

    <div v-if="generatorText" class="flex justify-center">
      <div class="bg-surface-overlay border border-border rounded-lg p-4 inline-block">
        <canvas ref="generatorCanvas" />
      </div>
    </div>

    <div v-if="generatorText && !generatorError" class="flex flex-wrap gap-2">
      <button
        type="button"
        @click="downloadGeneratorPng"
        class="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
      >
        Download PNG
      </button>
      <CopyButton :value="generatorDataUri" label="Copy Data URI" label-copied="Copied!" />
    </div>
  </div>
</template>
