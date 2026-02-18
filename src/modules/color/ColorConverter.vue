<script setup lang="ts">
import CopyStatCard from '@components/CopyStatCard.vue'
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

function rgbBarClass(key: string): string {
  switch (key) {
    case 'r':
      return 'bg-red-500'
    case 'g':
      return 'bg-green-500'
    case 'b':
      return 'bg-blue-500'
    default:
      return 'bg-accent'
  }
}

function selectColor(color: string): void {
  colorInput.value = color
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex gap-4 items-start">
      <div class="flex-1">
        <label class="block text-sm text-text-secondary mb-2">Enter a color (hex, rgb, hsl, or name)</label>
        <input
          v-model="colorInput"
          type="text"
          placeholder="#3b82f6, rgb(59,130,246), hsl(217,91%,60%), blue"
          class="w-full bg-surface-overlay border border-border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition-colors"
        />
      </div>
      <div class="pt-7">
        <label class="relative block w-12 h-12 rounded-lg border border-border overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow">
          <input
            v-model="pickerColor"
            type="color"
            class="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <div class="w-full h-full" :style="{ backgroundColor: colorInstance ? colorInstance.toHex() : '#000' }" />
        </label>
      </div>
    </div>

    <template v-if="colorInstance && formats">
      <div
        class="rounded-lg h-28 flex items-center justify-center text-lg font-semibold font-mono border border-border cursor-pointer active:opacity-80"
        :style="{ backgroundColor: formats.hex, color: formats.contrastColor }"
        @click="copy('preview', formats.hex)"
      >
        {{ formats.hex }}
        <span v-if="copiedKey === 'preview'" class="text-sm ml-2">Copied!</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CopyStatCard
          v-for="formatCard in FORMAT_CARDS"
          :key="formatCard.label"
          :title="formatCard.label"
          :value="formats[formatCard.key]"
        />
        <CopyStatCard title="Luminance" :value="formats.luminance" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ColorChannelCard
          title="RGB"
          :copy-value="formats.rgb"
          :channels="RGB_CHANNELS"
          :values="formats.rgbValues"
          :bar-class="rgbBarClass"
        />
        <ColorChannelCard
          title="HSL"
          :copy-value="formats.hsl"
          :channels="HSL_CHANNELS"
          :values="formats.hslValues"
          bar-class="bg-accent"
        />
      </div>

      <ColorHarmonies v-if="palette" :palette="palette" @select-color="selectColor" />
      <ColorShades v-if="palette" :shades="palette.shades" @select-color="selectColor" />
    </template>

    <div v-else-if="colorInput.trim()" class="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-sm text-error">
      Could not parse color. Try hex (#ff0000), rgb(255, 0, 0), hsl(0, 100%, 50%), or a CSS name (red).
    </div>
  </div>
</template>
