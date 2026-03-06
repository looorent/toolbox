<script setup lang="ts">
import { TbInput, TbStatCard } from '@components'
import { useBidirectionalConverter } from '@composables/useBidirectionalConverter'
import { useCopy } from '@composables/useCopy'
import { computed } from 'vue'
import ColorChannelCard from './ColorChannelCard.vue'
import ColorHarmonies from './ColorHarmonies.vue'
import ColorShades from './ColorShades.vue'
import { createColorInstance, getColorFormats, getColorPalette } from './logic'

const { copy, copiedKey } = useCopy()

const { left: colorInput, right: pickerColor } = useBidirectionalConverter({
  forward: value => {
    const instance = createColorInstance(value)
    return instance ? instance.toHex() : null
  },
  backward: value => ({ value, error: false }),
  initial: '#3b82f6',
})

const colorInstance = computed(() => createColorInstance(colorInput.value))
const formats = computed(() => colorInstance.value ? getColorFormats(colorInstance.value) : null)
const palette = computed(() => colorInstance.value ? getColorPalette(colorInstance.value) : null)

const FORMAT_CARDS = [
  { label: 'HEX', key: 'hex' as const },
  { label: 'RGB', key: 'rgb' as const },
  { label: 'HSL', key: 'hsl' as const },
  { label: 'HSV', key: 'hsv' as const },
  { label: 'CMYK', key: 'cmyk' as const },
]

const RGB_CHANNELS = [
  { key: 'r', label: 'R', max: 255 },
  { key: 'g', label: 'G', max: 255 },
  { key: 'b', label: 'B', max: 255 },
]

const HSL_CHANNELS = [
  { key: 'h', label: 'H', max: 360 },
  { key: 's', label: 'S', max: 100 },
  { key: 'l', label: 'L', max: 100 },
]

function rgbBarColor(key: string): string {
  switch (key) {
    case 'r':
      return '#ef4444'
    case 'g':
      return '#22c55e'
    case 'b':
      return '#3b82f6'
    default:
      return 'var(--color-accent)'
  }
}

function selectColor(color: string): void {
  colorInput.value = color
}
</script>

<template>
  <div class="tb-stack-6">
    <div class="tb-row tb-row--gap-4 tb-items-start">
      <div class="tb-flex-1">
        <label class="tb-label tb-text-description">Enter a color (hex, rgb, hsl, or name)</label>
        <TbInput v-model="colorInput" placeholder="#3b82f6, rgb(59,130,246), hsl(217,91%,60%), blue" />
      </div>
      <div class="tb-pt-12">
        <label class="tb-relative tb-overflow-hidden tb-color-picker">
          <input
            v-model="pickerColor"
            type="color"
            class="tb-color-picker__input"
          />
          <div class="tb-color-picker__preview" :style="{ backgroundColor: colorInstance ? colorInstance.toHex() : '#000' }" />
        </label>
      </div>
    </div>

    <template v-if="colorInstance && formats">
      <div
        class="tb-flex-center tb-font-mono tb-color-banner"
        :style="{ backgroundColor: formats.hex, color: formats.contrastColor }"
        @click="copy('preview', formats.hex)"
      >
        {{ formats.hex }}
        <span v-if="copiedKey === 'preview'" role="status" class="tb-text-sm tb-ml-4">Copied!</span>
      </div>

      <div class="tb-grid-2">
        <TbStatCard
          v-for="formatCard in FORMAT_CARDS"
          :key="formatCard.label"
          :title="formatCard.label"
          :value="formats[formatCard.key]"
        />
        <TbStatCard title="Luminance" :value="formats.luminance" />
      </div>

      <div class="tb-grid-2 tb-gap-8">
        <ColorChannelCard
          title="RGB"
          :copy-value="formats.rgb"
          :channels="RGB_CHANNELS"
          :values="formats.rgbValues"
          :bar-color="rgbBarColor"
        />
        <ColorChannelCard
          title="HSL"
          :copy-value="formats.hsl"
          :channels="HSL_CHANNELS"
          :values="formats.hslValues"
          bar-color="var(--color-accent)"
        />
      </div>

      <ColorHarmonies v-if="palette" :palette="palette" @select-color="selectColor" />
      <ColorShades v-if="palette" :shades="palette.shades" @select-color="selectColor" />
    </template>

    <div v-else-if="colorInput.trim()" class="tb-alert tb-alert--error">
      Could not parse color. Try hex (#ff0000), rgb(255, 0, 0), hsl(0, 100%, 50%), or a CSS name (red).
    </div>
  </div>
</template>
