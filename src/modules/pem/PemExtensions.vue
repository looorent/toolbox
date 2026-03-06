<script setup lang="ts">
import { TbCard, TbKvTable } from '@components'
import { computed } from 'vue'
import { formatBasicConstraints } from './logic'

const props = defineProps<{
  basicConstraints: { ca: boolean; pathLen?: number } | null
  keyUsage: string[] | null
  extendedKeyUsage: string[] | null
}>()

const entries = computed(() => {
  const result: Array<{ key: string; value: string }> = []
  if (props.basicConstraints) {
    result.push({ key: 'Basic Constraints', value: formatBasicConstraints(props.basicConstraints) })
  }
  if (props.keyUsage) {
    result.push({ key: 'Key Usage', value: props.keyUsage.join(', ') })
  }
  if (props.extendedKeyUsage) {
    result.push({ key: 'Extended Key Usage', value: props.extendedKeyUsage.join(', ') })
  }
  return result
})
</script>

<template>
  <TbCard v-if="entries.length" title="Extensions">
    <TbKvTable :entries="entries" copyable key-size="md" />
  </TbCard>
</template>
