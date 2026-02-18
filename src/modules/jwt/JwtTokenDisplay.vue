<script setup lang="ts">
import CopyRow from '@/components/CopyRow.vue'

defineProps<{
  parts: [string, string, string]
  rawToken: string
}>()
</script>

<template>
  <CopyRow
    :value="rawToken"
    class="bg-surface-overlay border border-border rounded-lg px-4 py-3 font-mono text-sm break-all leading-relaxed transition-opacity"
  >
    <span class="text-red-400">{{ parts[0] }}</span><span class="text-text-muted">.</span><span class="text-purple-400">{{ parts[1] }}</span><span class="text-text-muted">.</span><span class="text-cyan-400">{{ parts[2] }}</span>
  </CopyRow>
</template>
