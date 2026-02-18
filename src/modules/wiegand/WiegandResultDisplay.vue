<script setup lang="ts">
import CopyStatCard from '@components/CopyStatCard.vue'
import type { WiegandResult } from './types'

defineProps<{ result: WiegandResult }>()
</script>

<template>
  <div v-if="result.mode === 'error'" class="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-sm text-error">
    {{ result.error }}
  </div>

  <template v-else-if="result.mode === 'encode'">
    <div v-if="result.encoded26" class="space-y-4">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Wiegand 26-bit</h3>
      <div class="grid grid-cols-2 gap-4">
        <CopyStatCard title="Hex" :value="result.encoded26.wiegand26InHexadecimal" value-class="text-lg font-mono font-bold text-accent" />
        <CopyStatCard title="Decimal" :value="`${result.encoded26.wiegand26InDecimal}`" value-class="text-lg font-mono font-medium text-text-primary" />
        <CopyStatCard title="Facility Code" :value="`${result.encoded26.facilityCode}`" value-class="text-lg font-mono font-medium text-text-primary" />
        <CopyStatCard title="ID Number" :value="`${result.encoded26.idNumber}`" value-class="text-lg font-mono font-medium text-text-primary" />
      </div>
      <CopyStatCard title="FC + ID Combined" :value="`${result.encoded26.facilityCodeAndIdNumber}`" value-class="text-lg font-mono font-medium text-text-primary" />
    </div>

    <div v-if="result.encoded64" class="space-y-2">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Wiegand 64-bit</h3>
      <CopyStatCard title="Hex" :value="result.encoded64" value-class="text-lg font-mono font-bold text-accent break-all" />
    </div>
  </template>

  <div v-else-if="result.mode === 'decode26' && result.decoded" class="grid grid-cols-2 gap-4">
    <CopyStatCard title="Facility Code" :value="result.decoded.facilityCode.toString()" value-class="text-lg font-mono font-medium text-text-primary" />
    <CopyStatCard title="ID Number" :value="result.decoded.idNumber.toString()" value-class="text-lg font-mono font-medium text-text-primary" />
    <CopyStatCard title="Decimal" :value="result.decoded.wiegand26InDecimal.toString()" value-class="text-lg font-mono font-medium text-text-primary" />
    <CopyStatCard title="FC + ID Combined" :value="result.decoded.facilityCodeAndIdNumber.toString()" value-class="text-lg font-mono font-medium text-text-primary" />
  </div>

  <template v-else-if="result.mode === 'decode64' && result.decoded">
    <CopyStatCard title="License Plate" :value="result.decoded" value-class="text-2xl font-mono font-bold text-accent" />
  </template>
</template>
