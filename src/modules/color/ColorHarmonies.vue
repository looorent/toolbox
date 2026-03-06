<script setup lang="ts">
import { TbCard, TbSwatch } from '@components'
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
  <TbCard title="Color Harmonies" class="tb-stack">
    <div v-for="harmony in harmonyGroups" :key="harmony.label" class="tb-stack-2">
      <p class="tb-hint">{{ harmony.label }}</p>
      <div class="tb-row">
        <TbSwatch
          v-for="(color, colorIndex) in getHarmonyColors(harmony.label)"
          :key="color"
          :color="color"
          :copied="copiedKey === `${harmony.label}-${colorIndex}`"
          @click="handleColorClick(color, harmony.label, colorIndex)"
        />
      </div>
    </div>
  </TbCard>
</template>
