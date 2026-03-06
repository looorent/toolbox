<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { buildSvgString, computeBoundingBox, isValidPathD, viewBoxFromBoundingBox } from './logic'
import SvgPathControls from './SvgPathControls.vue'
import SvgPathInput from './SvgPathInput.vue'
import SvgPathPreview from './SvgPathPreview.vue'

const pathData = ref('')
const stroke = ref('#7a9a60')
const fill = ref('none')
const showGrid = ref(true)
const error = ref(false)
const viewBox = ref('0 0 100 100')
const validPath = ref(false)

watch(pathData, async () => {
  const trimmedPath = pathData.value.trim()
  if (!trimmedPath) {
    error.value = false
    validPath.value = false
    viewBox.value = '0 0 100 100'
    return
  }

  if (!isValidPathD(trimmedPath)) {
    error.value = true
    validPath.value = false
    return
  }

  await nextTick()
  const boundingBox = computeBoundingBox(trimmedPath)
  if (boundingBox) {
    viewBox.value = viewBoxFromBoundingBox(boundingBox)
    error.value = false
    validPath.value = true
  } else {
    error.value = true
    validPath.value = false
  }
})

const svgString = computed(() => validPath.value ? buildSvgString(pathData.value.trim(), viewBox.value, stroke.value, fill.value) : '')
</script>

<template>
  <div class="tb-stack-6">
    <p class="tb-text-description">Paste an SVG path <code class="tb-code-inline tb-text-accent">d</code> attribute to visualize it.</p>

    <SvgPathInput v-model="pathData" :error="error" />

    <SvgPathControls
      v-model:stroke="stroke"
      v-model:fill="fill"
      v-model:show-grid="showGrid"
      :valid-path="validPath"
      :svg-string="svgString"
    />

    <SvgPathPreview
      :path-data="pathData.trim()"
      :view-box="viewBox"
      :stroke="stroke"
      :fill="fill"
      :show-grid="showGrid"
      :valid-path="validPath"
    />

    <div v-if="validPath" class="tb-row tb-row--gap-3">
      <span class="tb-label tb-label--inline">ViewBox</span>
      <code class="tb-code-inline tb-text-secondary">{{ viewBox }}</code>
    </div>
  </div>
</template>
