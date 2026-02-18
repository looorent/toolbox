<script setup lang="ts">
import { useCopy } from '@composables/useCopy'

interface Channel {
  key: string
  label: string
  max: number
}

const props = defineProps<{
  title: string
  copyValue: string
  channels: Channel[]
  values: Record<string, number>
  barClass: string | ((key: string) => string)
}>()

const { copy, copiedKey } = useCopy()

function barColorClass(key: string): string {
  return typeof props.barClass === 'function' ? props.barClass(key) : props.barClass
}
</script>

<template>
  <div
    class="bg-surface-overlay border border-border rounded-lg p-4 space-y-3 cursor-pointer active:opacity-80"
    @click="copy(title, copyValue)"
  >
    <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted">
      {{ title }}
      <span v-if="copiedKey === title" class="text-success normal-case tracking-normal ml-1">Copied!</span>
    </h3>
    <div v-for="channel in channels" :key="channel.key" class="space-y-1">
      <div class="flex justify-between text-xs">
        <span class="text-text-muted uppercase">{{ channel.label }}</span>
        <span class="font-mono text-text-primary">{{ Math.round(values[channel.key] ?? 0) }}{{ channel.max === 360 ? '°' : channel.max === 100 ? '%' : '' }}</span>
      </div>
      <div class="h-1.5 bg-surface-base rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all"
          :class="barColorClass(channel.key)"
          :style="{ width: `${((values[channel.key] ?? 0) / channel.max) * 100}%` }"
        />
      </div>
    </div>
  </div>
</template>
