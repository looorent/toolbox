<script setup lang="ts">
import { TbButton, TbOptionGroup, type TbOptionGroupOption, TbSlider } from '@components'
import { computed, ref } from 'vue'
import { findActivePreset, presets } from './presets'
import type { ConversionParams } from './types'

const props = defineProps<{
  disabled?: boolean
}>()

const params = defineModel<ConversionParams>({ required: true })

const activePresetKey = computed({
  get: (): string => findActivePreset(params.value) ?? '',
  set: (key: string) => {
    const preset = presets.find(preset => preset.key === key)

    if (preset) {
      params.value = { ...preset.params }
    }
  },
})
const showAdvanced = ref(false)

const presetOptions: TbOptionGroupOption[] = presets.map(preset => ({ value: preset.key, label: preset.label, title: preset.description }))

const traceModes: TbOptionGroupOption[] = [
  { value: 'spline', label: 'Spline', description: 'Smooth curves (best for most images)' },
  { value: 'polygon', label: 'Polygon', description: 'Straight segments (pixel-art style)' },
  { value: 'none', label: 'None', description: 'No path simplification (raw pixel edges)' },
]

const clusteringModes: TbOptionGroupOption[] = [
  { value: 'color', label: 'Color', description: 'Full color tracing with clustering' },
  { value: 'binary', label: 'B/W', description: 'Black and white tracing' },
]

const hierarchicalModes: TbOptionGroupOption[] = [
  { value: 'stacked', label: 'Stacked', description: 'Layers stacked on top of each other' },
  { value: 'cutout', label: 'Cutout', description: 'Shapes cut out from layers below' },
]

const sliders = computed(() => {
  const colorSliders = params.value.clusteringMode === 'color'
    ? [
        {
          key: 'colorPrecision' as const,
          label: 'Color Precision',
          min: 1,
          max: 8,
          step: 1,
          description: 'How many colors to distinguish. Higher values preserve more color detail, lower values simplify.',
        },
        {
          key: 'layerDifference' as const,
          label: 'Gradient Step',
          min: 0,
          max: 128,
          step: 1,
          description: 'Color difference between gradient layers. Higher values produce fewer layers and a more posterized look.',
        },
      ]
    : []

  return [
    ...colorSliders,
    {
      key: 'filterSpeckle' as const,
      label: 'Filter Speckle',
      min: 0,
      max: 128,
      step: 1,
      description: 'Removes clusters smaller than this size (in pixels). Increase to clean up noise and tiny artifacts.',
    },
    {
      key: 'cornerThreshold' as const,
      label: 'Corner Threshold',
      min: 0,
      max: 180,
      step: 1,
      description: 'Angle (in degrees) below which a point is treated as a corner. Lower values produce rounder shapes; higher values keep sharp corners.',
    },
    {
      key: 'lengthThreshold' as const,
      label: 'Length Threshold',
      min: 0,
      max: 100,
      step: 0.5,
      description: 'Minimum segment length to keep. Higher values simplify paths by dropping short segments, reducing file size.',
    },
    {
      key: 'spliceThreshold' as const,
      label: 'Splice Threshold',
      min: 0,
      max: 180,
      step: 1,
      description: 'Angle threshold for joining adjacent curves. Higher values merge more curves together for smoother output.',
    },
    {
      key: 'pathPrecision' as const,
      label: 'Path Precision',
      min: 0,
      max: 8,
      step: 1,
      description: 'Decimal places in SVG path coordinates. Higher values are more precise but produce larger files.',
    },
  ]
})
</script>

<template>
  <div class="tb-stack-4" :class="{ 'tb-disabled': props.disabled }">
    <TbOptionGroup v-model="activePresetKey" label="Preset" size="sm" :options="presetOptions" :disabled="props.disabled" />

    <TbButton
      variant="ghost"
      :disabled="props.disabled"
      @click="showAdvanced = !showAdvanced"
    >
      <span class="tb-inline-block tb-chevron" :class="{ 'tb-chevron--open': showAdvanced }">&#9654;</span>
      Advanced parameters
    </TbButton>

    <div v-if="showAdvanced" class="tb-stack-4">
      <TbOptionGroup v-model="params.clusteringMode" variant="segmented" label="Clustering" :options="clusteringModes" :disabled="props.disabled" />

      <TbOptionGroup
        v-if="params.clusteringMode === 'color'"
        v-model="params.hierarchical"
        variant="segmented"
        label="Hierarchy"
        :options="hierarchicalModes"
        :disabled="props.disabled"
      />

      <TbOptionGroup v-model="params.mode" variant="segmented" label="Curve fitting" :options="traceModes" :disabled="props.disabled" />

      <div class="tb-grid-2 tb-gap-8">
        <TbSlider
          v-for="slider in sliders"
          :key="slider.key"
          v-model="params[slider.key]"
          :label="slider.label"
          :min="slider.min"
          :max="slider.max"
          :step="slider.step"
          :description="slider.description"
          :disabled="props.disabled"
        />
      </div>
    </div>
  </div>
</template>