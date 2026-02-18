<script setup lang="ts">
import CopyRow from '@/components/CopyRow.vue'

defineProps<{
  signature: string
}>()
</script>

<template>
  <div class="bg-surface-overlay border border-border rounded-lg overflow-hidden">
    <div class="px-4 py-2 border-b border-border">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-cyan-400">Signature</h3>
    </div>
    <CopyRow :value="signature" class="px-4 py-3">
      <code class="text-sm font-mono text-text-muted break-all">{{ signature }}</code>
    </CopyRow>
  </div>
</template>
