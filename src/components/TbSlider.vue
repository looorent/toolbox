<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  label?: string
  description?: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
})

const model = defineModel<number>({ required: true })
const inputId = useId()
</script>

<template>
  <div class="tb-stack-1">
    <div v-if="label" class="tb-row tb-row--between">
      <label :for="inputId" class="tb-label tb-label--inline">{{ label }}</label>
      <span class="tb-slider__value">{{ model }}</span>
    </div>
    <input
      :id="inputId"
      v-model.number="model"
      type="range"
      class="tb-slider"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      v-bind="$attrs"
    />
    <p v-if="description" class="tb-text-description tb-slider__description">{{ description }}</p>
  </div>
</template>
