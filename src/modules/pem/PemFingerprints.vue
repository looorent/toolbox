<script setup lang="ts">
import CopyRow from '@components/CopyRow.vue'
import { ref, watch } from 'vue'
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
</script>

<template>
  <div v-if="fingerprints" class="bg-surface-overlay border border-border rounded-lg p-4 space-y-3">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Fingerprints</h3>
    <div class="space-y-2 text-sm">
      <CopyRow :value="fingerprints.sha256">
        <span class="text-text-muted">SHA-256</span>
        <p class="font-mono text-text-primary break-all mt-0.5">{{ fingerprints.sha256 }}</p>
      </CopyRow>
      <CopyRow :value="fingerprints.sha1">
        <span class="text-text-muted">SHA-1</span>
        <p class="font-mono text-text-primary break-all mt-0.5">{{ fingerprints.sha1 }}</p>
      </CopyRow>
    </div>
  </div>
</template>
