<script setup lang="ts">
import CopyText from '@components/CopyText.vue'
import { computed } from 'vue'

const props = defineProps<{
  title: string
  parts: Record<string, string>
}>()

const location = computed(() =>
  [props.parts.L, props.parts.ST, props.parts.C].filter(Boolean).join(', ')
)
</script>

<template>
  <div class="bg-surface-overlay border border-border rounded-lg p-4 space-y-3">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted">{{ title }}</h3>
    <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      <template v-if="parts.CN">
        <span class="text-text-muted">Common Name</span>
        <CopyText :value="parts.CN" class="font-mono text-text-primary" />
      </template>
      <template v-if="parts.O">
        <span class="text-text-muted">Organization</span>
        <CopyText :value="parts.O" class="font-mono text-text-primary" />
      </template>
      <template v-if="parts.OU">
        <span class="text-text-muted">Organizational Unit</span>
        <CopyText :value="parts.OU" class="font-mono text-text-primary" />
      </template>
      <template v-if="location">
        <span class="text-text-muted">Location</span>
        <CopyText :value="location" class="font-mono text-text-primary" />
      </template>
    </div>
  </div>
</template>
