<script setup lang="ts">
import { TbCheckbox, TbCopyButton } from '@components'

defineProps<{
  validPath: boolean
  svgString: string
}>()

const stroke = defineModel<string>('stroke', { required: true })
const fill = defineModel<string>('fill', { required: true })
const showGrid = defineModel<boolean>('showGrid', { required: true })
</script>

<template>
  <div class="tb-row tb-row--gap-4 tb-row--wrap">
    <label class="tb-row tb-text-xs tb-text-secondary">
      <span class="tb-label tb-label--inline">Stroke</span>
      <input v-model="stroke" type="color" class="tb-color-input" />
    </label>

    <label class="tb-row tb-text-xs tb-text-secondary">
      <span class="tb-label tb-label--inline">Fill</span>
      <select
        v-model="fill"
        class="tb-input tb-input--small tb-font-mono tb-w-auto"
      >
        <option value="none">none</option>
        <option :value="stroke">stroke color</option>
        <option value="currentColor">currentColor</option>
      </select>
    </label>

    <TbCheckbox v-model="showGrid" label="Grid" />

    <TbCopyButton v-if="validPath" :value="svgString" label="Copy SVG" class="tb-ml-auto" />
  </div>
</template>
