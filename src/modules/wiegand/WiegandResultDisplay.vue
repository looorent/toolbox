<script setup lang="ts">
import { TbCard, TbKvTable } from '@components'
import { computed } from 'vue'
import type { WiegandResult } from './types'

const props = defineProps<{ result: WiegandResult }>()

const encode26Entries = computed(() => {
  if (props.result.mode !== 'encode' || !props.result.encoded26) {
    return []
  }
  const encoded = props.result.encoded26
  return [
    { key: 'Hex', value: encoded.wiegand26InHexadecimal },
    { key: 'Decimal', value: `${encoded.wiegand26InDecimal}` },
    { key: 'Facility Code', value: `${encoded.facilityCode}` },
    { key: 'ID Number', value: `${encoded.idNumber}` },
    { key: 'FC + ID Combined', value: `${encoded.facilityCodeAndIdNumber}` },
  ]
})

const decode26Entries = computed(() => {
  if (props.result.mode !== 'decode26' || !props.result.decoded) {
    return []
  }
  const decoded = props.result.decoded
  return [
    { key: 'Facility Code', value: decoded.facilityCode.toString() },
    { key: 'ID Number', value: decoded.idNumber.toString() },
    { key: 'Decimal', value: decoded.wiegand26InDecimal.toString() },
    { key: 'FC + ID Combined', value: decoded.facilityCodeAndIdNumber.toString() },
  ]
})
</script>

<template>
  <div v-if="result.mode === 'error'" role="alert" class="tb-alert tb-alert--error">
    {{ result.error }}
  </div>

  <div v-else-if="result.mode === 'encode'" class="tb-stack-4">
    <TbCard v-if="result.encoded26" title="Wiegand 26-bit">
      <TbKvTable :entries="encode26Entries" copyable />
    </TbCard>

    <TbCard v-if="result.encoded64" title="Wiegand 64-bit">
      <TbKvTable :entries="[{ key: 'Hex', value: result.encoded64 }]" copyable />
    </TbCard>
  </div>

  <TbCard v-else-if="result.mode === 'decode26' && result.decoded" title="Wiegand 26-bit">
    <TbKvTable :entries="decode26Entries" copyable />
  </TbCard>

  <TbCard v-else-if="result.mode === 'decode64' && result.decoded" title="Wiegand 64-bit">
    <TbKvTable :entries="[{ key: 'License Plate', value: result.decoded }]" copyable />
  </TbCard>
</template>
