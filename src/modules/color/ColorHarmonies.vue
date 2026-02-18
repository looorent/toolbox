<script setup lang="ts">
import { useCopy } from '@composables/useCopy'
import type { ColorPalette } from './types'

const props = defineProps<{
  palette: ColorPalette
}>()

const emit = defineEmits<{
  selectColor: [color: string]
}>()

const { copy, copiedKey } = useCopy()

interface HarmonyGroup {
  label: string
  colors: string[]
}

const harmonyGroups: HarmonyGroup[] = [
  { label: 'Complementary', colors: [] },
  { label: 'Analogous', colors: [] },
  { label: 'Triadic', colors: [] },
  { label: 'Split Complementary', colors: [] },
]

function getHarmonyColors(label: string): string[] {
  switch (label) {
    case 'Complementary':
      return [props.palette.complementary]
    case 'Analogous':
      return props.palette.analogous
    case 'Triadic':
      return props.palette.triadic
    case 'Split Complementary':
      return props.palette.splitComplementary
    default:
      return []
  }
}

function handleColorClick(color: string, harmonyLabel: string, colorIndex: number) {
  copy(`${harmonyLabel}-${colorIndex}`, color.toUpperCase())
  emit('selectColor', color)
}
</script>

<template>
  <div class="bg-surface-overlay border border-border rounded-lg p-4 space-y-4">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Color Harmonies</h3>

    <div v-for="harmony in harmonyGroups" :key="harmony.label" class="space-y-1.5">
      <p class="text-xs text-text-muted">{{ harmony.label }}</p>
      <div class="flex gap-2">
        <button
          v-for="(color, colorIndex) in getHarmonyColors(harmony.label)"
          :key="color"
          type="button"
          class="h-8 flex-1 rounded-md border border-border cursor-pointer hover:scale-105 active:scale-95 transition-transform relative"
          :style="{ backgroundColor: color }"
          :title="color.toUpperCase()"
          @click="handleColorClick(color, harmony.label, colorIndex)"
        >
          <span
            v-if="copiedKey === `${harmony.label}-${colorIndex}`"
            class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
          >Copied!</span>
        </button>
      </div>
    </div>
  </div>
</template>
