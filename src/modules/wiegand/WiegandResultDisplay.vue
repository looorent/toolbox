<script setup lang="ts">
import { TbButton, TbCard, TbKvTable, TbTag } from '@components'
import type { WiegandCountry } from '@shared/modules/wiegand/countries'
import { computed } from 'vue'
import type { CountryPlates, WiegandResult } from './types'

const props = withDefaults(defineProps<{
  result: WiegandResult
  plateLookups?: CountryPlates[]
  plateLookupLoading?: boolean
  plateLookupError?: string | null
  supportedCountries?: WiegandCountry[]
}>(), {
  plateLookups: () => [],
  plateLookupLoading: false,
  plateLookupError: null,
  supportedCountries: () => [],
})

const emit = defineEmits<{
  retryPlateLookup: []
}>()

const countryNameByCode = computed(() => new Map(props.supportedCountries.map(country => [country.code, country.name])))
const countriesWithPlates = computed(() => props.plateLookups.filter(lookup => lookup.plates.length > 0 || lookup.error))
const emptyCountryCount = computed(() => props.plateLookups.length - countriesWithPlates.value.length)

function countryLabel(code: string): string {
  const name = countryNameByCode.value.get(code)
  return name ? `${name} (${code})` : code
}

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
    { key: 'Hex', value: decoded.wiegand26InHexadecimal },
    { key: 'Decimal', value: decoded.wiegand26InDecimal.toString() },
    { key: 'Facility Code', value: decoded.facilityCode.toString() },
    { key: 'ID Number', value: decoded.idNumber.toString() },
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

  <div v-else-if="result.mode === 'decode26' && result.decoded" class="tb-stack-4">
    <TbCard title="Wiegand 26-bit">
      <TbKvTable :entries="decode26Entries" copyable />
    </TbCard>

    <TbCard title="Plate Lookup">
      <div v-if="plateLookupLoading" class="tb-text-description">
        Looking up plates...
      </div>
      <div v-else-if="plateLookupError" class="tb-alert tb-alert--error tb-row tb-row--between">
        <span>{{ plateLookupError }}</span>
        <TbButton variant="secondary" size="sm" @click="emit('retryPlateLookup')">Retry</TbButton>
      </div>
      <div v-else class="tb-stack-4">
        <div v-for="lookup in countriesWithPlates" :key="lookup.country">
          <p class="tb-section-subtitle">{{ countryLabel(lookup.country) }}</p>
          <div v-if="lookup.error" class="tb-alert tb-alert--error">
            {{ lookup.error }}
          </div>
          <div v-else class="tb-row tb-row--gap-2 tb-row--wrap">
            <TbTag v-for="plate in lookup.plates.toSorted()" :key="plate" :copyable="plate">
              {{ plate }}
            </TbTag>
          </div>
        </div>
        <p v-if="countriesWithPlates.length === 0" class="tb-hint">No plates found in any country</p>
        <p v-else-if="emptyCountryCount > 0" class="tb-hint">No plates found in {{ emptyCountryCount }} other {{ emptyCountryCount === 1 ? 'country' : 'countries' }}</p>
      </div>
    </TbCard>
  </div>

  <TbCard v-else-if="result.mode === 'decode64' && result.decoded" title="Wiegand 64-bit">
    <TbKvTable :entries="[{ key: 'License Plate', value: result.decoded }]" copyable />
  </TbCard>
</template>
