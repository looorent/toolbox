<script setup lang="ts">
import { useCopy } from '@composables/useCopy'

const props = defineProps<{
  value: string
}>()

const { copy, copied } = useCopy()
</script>

<template>
  <div
    class="tb-copy-row"
    role="button"
    tabindex="0"
    @click="copy(props.value)"
    @keydown.enter="copy(props.value)"
    @keydown.space.prevent="copy(props.value)"
  >
    <slot />
    <span v-if="copied" role="status" class="tb-copy-row__feedback">Copied!</span>
  </div>
</template>
