<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  error?: boolean
  placeholder?: string
  size?: 'default' | 'sm'
}>(), {
  error: false,
  placeholder: '',
  size: 'default',
})

const model = defineModel<string | number>({ default: '' })
</script>

<template>
  <input
    type="text"
    class="tb-input"
    :class="{ 'tb-input--error': error, 'tb-input--small': size === 'sm' }"
    :placeholder="placeholder"
    v-bind="$attrs"
    v-model="model"
  />
</template>
