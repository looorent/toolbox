<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  label?: string
}>()

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="tb-checkbox">
    <input
      v-model="model"
      type="checkbox"
      class="tb-checkbox__input"
      v-bind="$attrs"
    />
    <span v-if="label" class="tb-checkbox__label">{{ label }}</span>
  </label>
</template>
