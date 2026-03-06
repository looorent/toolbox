<script setup lang="ts">
import { useCopy } from '@composables/useCopy'

withDefaults(defineProps<{
  title: string
  value: string
  valueClass?: string
  labelCopied?: string
}>(), {
  valueClass: 'tb-stat-card__value',
  labelCopied: 'Copied!',
})

const { copy, copied } = useCopy()
</script>

<template>
  <div
    class="tb-stat-card"
    role="button"
    tabindex="0"
    @click="copy(value)"
    @keydown.enter="copy(value)"
    @keydown.space.prevent="copy(value)"
  >
    <p class="tb-stat-card__title">
      {{ title }}
      <span v-if="copied" role="status" class="tb-stat-card__copied">{{ labelCopied }}</span>
    </p>
    <slot>
      <p :class="valueClass">{{ value }}</p>
    </slot>
  </div>
</template>
