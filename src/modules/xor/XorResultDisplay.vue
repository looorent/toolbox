<script setup lang="ts">
import { TbCodeBlock, TbStatCard } from '@components'
import type { XorResult } from './types'

defineProps<{ result: XorResult }>()
</script>

<template>
  <div v-if="result.error" role="alert" class="tb-alert tb-alert--error">
    {{ result.error }}
  </div>

  <template v-else>
    <TbCodeBlock title="Input Bytes" :value="result.bytesHex ?? ''" :copyable="true" />

    <div class="tb-grid-3">
      <TbStatCard title="Hex" :value="result.hex ?? ''" value-class="tb-text-lg tb-font-mono tb-font-bold tb-text-accent" />
      <TbStatCard title="Decimal" :value="`${result.decimal ?? ''}`" value-class="tb-text-lg tb-font-mono tb-font-bold tb-text-primary" />
      <TbStatCard title="Binary" :value="result.binary ?? ''" value-class="tb-text-lg tb-font-mono tb-font-bold tb-text-primary" />
    </div>
  </template>
</template>
