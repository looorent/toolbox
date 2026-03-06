<script setup lang="ts">
import { TbCard, TbKvTable } from '@components'
import { computed } from 'vue'

const props = defineProps<{
  title: string
  parts: Record<string, string>
}>()

const location = computed(() =>
  [props.parts.L, props.parts.ST, props.parts.C].filter(Boolean).join(', ')
)

const entries = computed(() => {
  const result: Array<{ key: string; value: string }> = []
  if (props.parts.CN) {
    result.push({ key: 'Common Name', value: props.parts.CN })
  }
  if (props.parts.O) {
    result.push({ key: 'Organization', value: props.parts.O })
  }
  if (props.parts.OU) {
    result.push({ key: 'Organizational Unit', value: props.parts.OU })
  }
  if (location.value) {
    result.push({ key: 'Location', value: location.value })
  }
  return result
})
</script>

<template>
  <TbCard :title="title">
    <TbKvTable :entries="entries" copyable key-size="md" />
  </TbCard>
</template>
