<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  error?: boolean
  size?: 'default' | 'sm'
}>(), {
  error: false,
  size: 'default',
})

const model = defineModel<string>({ default: '' })
</script>

<template>
  <select
    class="tb-select"
    :class="{
      'tb-select--error': error,
      'tb-select--sm': size === 'sm',
    }"
    v-bind="$attrs"
    v-model="model"
  >
    <slot />
  </select>
</template>
