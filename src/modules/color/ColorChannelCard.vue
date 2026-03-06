<script setup lang="ts">
import { TbCard } from '@components'
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
  barColor: string | ((key: string) => string)
}>()

const { copy, copiedKey } = useCopy()

function resolveBarColor(key: string): string {
  return typeof props.barColor === 'function' ? props.barColor(key) : props.barColor
}
</script>

<template>
  <TbCard clickable class="tb-stack-3" @click="copy(title, copyValue)">
    <h3 class="tb-label tb-label--inline">
      {{ title }}
      <span v-if="copiedKey === title" role="status" class="tb-stat-card__copied tb-text-success">Copied!</span>
    </h3>
    <div v-for="channel in channels" :key="channel.key" class="tb-stack-1">
      <div class="tb-row tb-row--between tb-text-xs">
        <span class="tb-text-muted tb-uppercase">{{ channel.label }}</span>
        <span class="tb-font-mono tb-text-primary">{{ Math.round(values[channel.key] ?? 0) }}{{ channel.max === 360 ? '°' : channel.max === 100 ? '%' : '' }}</span>
      </div>
      <div class="tb-progress-bar">
        <div
          class="tb-progress-bar__fill"
          :style="{ width: `${((values[channel.key] ?? 0) / channel.max) * 100}%`, backgroundColor: resolveBarColor(channel.key) }"
        />
      </div>
    </div>
  </TbCard>
</template>
