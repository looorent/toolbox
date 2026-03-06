<script setup lang="ts">
import { TbCard, TbKvTable } from '@components'
import { computed, ref, watch } from 'vue'
import { computeFingerprints } from './logic'
import type { Fingerprints } from './types'

const props = defineProps<{
  der: Uint8Array
}>()

const fingerprints = ref<Fingerprints | null>(null)

watch(() => props.der, async newDer => {
  fingerprints.value = null
  try {
    fingerprints.value = await computeFingerprints(newDer)
  } catch {
    // Ignore digest errors
  }
}, { immediate: true })

const entries = computed(() => {
  if (!fingerprints.value) {
    return []
  }
  return [
    { key: 'SHA-256', value: fingerprints.value.sha256 },
    { key: 'SHA-1', value: fingerprints.value.sha1 },
  ]
})
</script>

<template>
  <TbCard v-if="fingerprints" title="Fingerprints">
    <TbKvTable :entries="entries" copyable key-size="xs" />
  </TbCard>
</template>
