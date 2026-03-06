<script setup lang="ts">
import { TbStatCard } from '@components'
import type { EpochResult, ResultField } from './types'

defineProps<{
  result: EpochResult
  fields: ResultField[]
  tzField: ResultField
}>()
</script>

<template>
  <div class="tb-stack-3">
    <div class="tb-grid-2">
      <TbStatCard
        v-for="field in fields"
        :key="field.key"
        :title="field.label"
        :value="field.value(result)"
      />
    </div>

    <TbStatCard
      :title="tzField.label"
      :value="tzField.value(result)"
      value-class="tb-stat-card__value tb-break-all"
      class="tb-card--accent"
    />
  </div>
</template>
