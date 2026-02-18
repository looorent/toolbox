<script setup lang="ts">
import CopyRow from '@components/CopyRow.vue'
import { formatBasicConstraints } from './logic'

defineProps<{
  basicConstraints: { ca: boolean; pathLen?: number } | null
  keyUsage: string[] | null
  extendedKeyUsage: string[] | null
}>()
</script>

<template>
  <div v-if="keyUsage || extendedKeyUsage || basicConstraints" class="bg-surface-overlay border border-border rounded-lg p-4 space-y-3">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Extensions</h3>
    <div class="space-y-2 text-sm">
      <CopyRow v-if="basicConstraints" :value="formatBasicConstraints(basicConstraints)">
        <span class="text-text-muted">Basic Constraints: </span>
        <span class="font-mono text-text-primary">
          CA={{ basicConstraints.ca }}
          <template v-if="basicConstraints.pathLen !== undefined">, pathLen={{ basicConstraints.pathLen }}</template>
        </span>
      </CopyRow>
      <CopyRow v-if="keyUsage" :value="keyUsage.join(', ')">
        <span class="text-text-muted">Key Usage: </span>
        <span class="font-mono text-text-primary">{{ keyUsage.join(', ') }}</span>
      </CopyRow>
      <CopyRow v-if="extendedKeyUsage" :value="extendedKeyUsage.join(', ')">
        <span class="text-text-muted">Extended Key Usage: </span>
        <span class="font-mono text-text-primary">{{ extendedKeyUsage.join(', ') }}</span>
      </CopyRow>
    </div>
  </div>
</template>
