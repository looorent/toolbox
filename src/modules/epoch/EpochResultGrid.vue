<script setup lang="ts">
import CopyButton from '@components/CopyButton.vue'
import CopyStatCard from '@components/CopyStatCard.vue'
import type { EpochResult, ResultField } from './types'

defineProps<{
  result: EpochResult
  fields: ResultField[]
  tzField: ResultField
}>()
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <CopyStatCard
        v-for="field in fields"
        :key="field.key"
        :title="field.label"
        :value="field.value(result)"
      />
    </div>

    <div class="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[10px] font-semibold uppercase tracking-wider text-accent">{{ tzField.label }}</span>
        <CopyButton :value="tzField.value(result)" />
      </div>
      <p class="text-sm font-mono text-text-primary break-all">{{ tzField.value(result) }}</p>
    </div>
  </div>
</template>
