<script setup lang="ts">
import TbCopyButton from './TbCopyButton.vue'

withDefaults(defineProps<{
  title?: string
  value: string
  copyable?: boolean
}>(), {
  copyable: false,
})
</script>

<template>
  <div>
    <label v-if="title" class="tb-label">{{ title }}</label>
    <div class="tb-relative">
      <code class="tb-code-block">{{ value }}</code>
      <TbCopyButton v-if="copyable" :value="value" class="tb-overlay-tr" />
    </div>
  </div>
</template>
