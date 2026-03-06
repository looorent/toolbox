<script setup lang="ts">
import { useCopy } from '@composables/useCopy'

const props = withDefaults(defineProps<{
  size?: 'default' | 'sm'
  copyable?: string | null
}>(), {
  size: 'default',
  copyable: null,
})

const { copy, copied } = useCopy()
</script>

<template>
  <component
    :is="props.copyable ? 'button' : 'span'"
    :type="props.copyable ? 'button' : undefined"
    :class="[
      'tb-tag',
      size === 'sm' ? 'tb-tag--sm' : '',
      props.copyable ? 'tb-tag--copyable' : '',
      copied ? 'tb-tag--copied' : '',
    ]"
    @click="props.copyable ? copy(props.copyable) : undefined"
  >
    <slot />
    <span v-if="copied" role="status" class="tb-text-tiny tb-text-success">Copied!</span>
  </component>
</template>
