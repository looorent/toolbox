<script setup lang="ts">
defineProps<{
  color: string
  copied?: boolean
  labelSize?: 'sm' | 'xs'
  variant?: 'default' | 'strip'
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="tb-flex-1 tb-relative tb-swatch"
    :class="variant === 'strip' ? 'tb-swatch--strip' : 'tb-rounded-sm'"
    :style="{ backgroundColor: color }"
    :title="color.toUpperCase()"
    @click="$emit('click')"
  >
    <span v-if="copied" role="status" class="tb-flex-center tb-font-bold tb-swatch__label" :class="labelSize === 'xs' ? 'tb-swatch__label--xs' : ''">Copied!</span>
  </button>
</template>
