<script setup lang="ts">
import { TbButton, TbCopyButton, TbFieldInput, TbInput } from '@components'
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
  <div class="tb-stack-6">
    <TbFieldInput
      v-model="generatorText"
      label="Text or URL"
      multiline
      :rows="3"
      placeholder="Enter text or URL..."
    />

    <div class="tb-row tb-row--gap-4 tb-row--wrap">
      <div class="tb-row">
        <label class="tb-text-description">Error correction</label>
        <div class="tb-row tb-row--gap-1">
          <button
            v-for="level in errorCorrectionLevels"
            :key="level"
            type="button"
            class="tb-btn-pill tb-btn-pill--sm tb-btn-pill--square tb-font-bold"
            :class="{ 'tb-btn-pill--active': errorCorrectionLevel === level }"
            @click="changeCorrectionLevel(level)"
          >
            {{ level }}
          </button>
        </div>
      </div>

      <div class="tb-row">
        <label class="tb-text-description">Size</label>
        <TbInput v-model.number="generatorSize" type="number" min="100" max="1000" step="50" class="tb-w-20" />
      </div>
    </div>

    <p v-if="generatorError" role="alert" class="tb-text-sm tb-text-error">{{ generatorError }}</p>

    <div v-if="generatorText" class="tb-flex-center">
      <div class="tb-card tb-inline-block">
        <canvas ref="generatorCanvas" />
      </div>
    </div>

    <div v-if="generatorText && !generatorError" class="tb-row tb-row--gap-2 tb-row--wrap">
      <TbButton @click="downloadGeneratorPng">Download PNG</TbButton>
      <TbCopyButton :value="generatorDataUri" label="Copy Data URI" label-copied="Copied!" />
    </div>
  </div>
</template>