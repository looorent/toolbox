<script setup lang="ts">
import { computed, ref } from 'vue'
import ParameterSlider from './ParameterSlider.vue'
import { findActivePreset, presets } from './presets'
import SegmentedControl from './SegmentedControl.vue'
import type { ClusteringMode, ConversionParams, HierarchicalMode, TraceMode } from './types'

const props = defineProps<{
  disabled?: boolean
}>()

const params = defineModel<ConversionParams>({ required: true })

const activePresetKey = computed(() => findActivePreset(params.value))
const showAdvanced = ref(false)

function applyPreset(key: string) {
  const preset = presets.find(preset => preset.key === key)

  if (preset) {
    params.value = { ...preset.params }
  }
}

const traceModes: { value: TraceMode; label: string; description: string }[] = [
  { value: 'spline', label: 'Spline', description: 'Smooth curves (best for most images)' },
  { value: 'polygon', label: 'Polygon', description: 'Straight segments (pixel-art style)' },
  { value: 'none', label: 'None', description: 'No path simplification (raw pixel edges)' },
]

const clusteringModes: { value: ClusteringMode; label: string; description: string }[] = [
  { value: 'color', label: 'Color', description: 'Full color tracing with clustering' },
  { value: 'binary', label: 'B/W', description: 'Black and white tracing' },
]

const hierarchicalModes: { value: HierarchicalMode; label: string; description: string }[] = [
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
  <div class="space-y-4" :class="{ 'opacity-50 pointer-events-none': props.disabled }">
    <!-- Presets -->
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-xs font-semibold uppercase tracking-wider text-text-muted">Preset</span>
      <button
        v-for="preset in presets"
        :key="preset.key"
        type="button"
        :disabled="props.disabled"
        class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer"
        :class="activePresetKey === preset.key
          ? 'bg-accent text-white'
          : 'bg-surface-overlay text-text-secondary hover:text-text-primary border border-border'"
        :title="preset.description"
        @click="applyPreset(preset.key)"
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- Advanced toggle -->
    <button
      type="button"
      class="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
      :disabled="props.disabled"
      @click="showAdvanced = !showAdvanced"
    >
      <span class="transition-transform" :class="showAdvanced ? 'rotate-90' : ''">&#9654;</span>
      Advanced parameters
    </button>

    <div v-if="showAdvanced" class="space-y-4">
      <SegmentedControl v-model="params.clusteringMode" label="Clustering" :options="clusteringModes" :disabled="props.disabled" />

      <SegmentedControl
        v-if="params.clusteringMode === 'color'"
        v-model="params.hierarchical"
        label="Hierarchy"
        :options="hierarchicalModes"
        :disabled="props.disabled"
      />

      <SegmentedControl v-model="params.mode" label="Curve fitting" :options="traceModes" :disabled="props.disabled" />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ParameterSlider
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
