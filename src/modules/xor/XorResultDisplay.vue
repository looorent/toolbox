<script setup lang="ts">
import CopyCodeBlock from '@components/CopyCodeBlock.vue'
import CopyStatCard from '@components/CopyStatCard.vue'
import type { XorResult } from './types'

defineProps<{ result: XorResult }>()
</script>

<template>
  <div v-if="result.error" class="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-sm text-error">
    {{ result.error }}
  </div>

  <template v-else>
    <CopyCodeBlock title="Input Bytes" :value="result.bytesHex ?? ''" />

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <CopyStatCard title="Hex" :value="result.hex ?? ''" value-class="text-lg font-mono font-bold text-accent" />
      <CopyStatCard title="Decimal" :value="`${result.decimal ?? ''}`" value-class="text-lg font-mono font-bold text-text-primary" />
      <CopyStatCard title="Binary" :value="result.binary ?? ''" value-class="text-lg font-mono font-bold text-text-primary" />
    </div>
  </template>
</template>
