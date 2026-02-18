<script setup lang="ts">
import { useCopy } from '@composables/useCopy'

const props = defineProps<{
  value: string
}>()

const { copy, copied } = useCopy()
</script>

<template>
  <span
    class="cursor-pointer active:opacity-80"
    @click="copy(props.value)"
  >
    <slot>{{ value }}</slot>
    <span v-if="copied" class="text-[10px] text-success ml-1">Copied!</span>
  </span>
</template>
