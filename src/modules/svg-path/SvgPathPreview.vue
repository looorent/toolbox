<script setup lang="ts">
import { computed } from 'vue'
import { gridLines } from './logic'
import type { PathBoundingBox } from './types'

const props = defineProps<{
  pathData: string
  viewBox: string
  stroke: string
  fill: string
  showGrid: boolean
  validPath: boolean
}>()

const parsedViewBox = computed<PathBoundingBox>(() => {
  const [x = 0, y = 0, width = 100, height = 100] = props.viewBox.split(' ').map(Number)
  return { x, y, width, height }
})

const horizontalGridLines = computed(() => gridLines(parsedViewBox.value.x, parsedViewBox.value.width))
const verticalGridLines = computed(() => gridLines(parsedViewBox.value.y, parsedViewBox.value.height))
</script>

<template>
  <div class="bg-surface-overlay border border-border rounded-lg p-4 flex items-center justify-center min-h-75">
    <svg
      v-if="validPath"
      :viewBox="viewBox"
      class="w-full h-auto max-h-125"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SVG path preview"
    >
      <!-- Grid -->
      <g v-if="showGrid" opacity="0.15">
        <line
          v-for="gridX in horizontalGridLines" :key="`gx${gridX}`"
          :x1="gridX" :y1="parsedViewBox.y" :x2="gridX" :y2="parsedViewBox.y + parsedViewBox.height"
          stroke="currentColor" :stroke-width="parsedViewBox.width * 0.002"
        />
        <line
          v-for="gridY in verticalGridLines" :key="`gy${gridY}`"
          :x1="parsedViewBox.x" :y1="gridY" :x2="parsedViewBox.x + parsedViewBox.width" :y2="gridY"
          stroke="currentColor" :stroke-width="parsedViewBox.height * 0.002"
        />
      </g>

      <!-- Axes -->
      <g v-if="showGrid" opacity="0.3">
        <line
          v-if="parsedViewBox.y <= 0 && 0 <= parsedViewBox.y + parsedViewBox.height"
          :x1="parsedViewBox.x" y1="0" :x2="parsedViewBox.x + parsedViewBox.width" y2="0"
          stroke="currentColor" :stroke-width="parsedViewBox.height * 0.003"
        />
        <line
          v-if="parsedViewBox.x <= 0 && 0 <= parsedViewBox.x + parsedViewBox.width"
          x1="0" :y1="parsedViewBox.y" x2="0" :y2="parsedViewBox.y + parsedViewBox.height"
          stroke="currentColor" :stroke-width="parsedViewBox.width * 0.003"
        />
      </g>

      <!-- Path -->
      <path
        :d="pathData"
        :stroke="stroke"
        :fill="fill"
        stroke-linecap="round"
        stroke-linejoin="round"
        :stroke-width="Math.max(parsedViewBox.width, parsedViewBox.height) * 0.008"
      />
    </svg>
    <p v-else class="text-sm text-text-muted">Paste a path to see the preview</p>
  </div>
</template>
