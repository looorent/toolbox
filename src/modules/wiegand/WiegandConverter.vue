<script setup lang="ts">
import { TbCard, TbExpandable, TbInput, TbOptionGroup, type TbOptionGroupOption } from '@components'
import type { WiegandCountry } from '@shared/modules/wiegand/countries'
import { onMounted, ref, watch } from 'vue'
import { processWiegand } from './logic'
import { fetchSupportedCountries, lookupPlatesForAllCountries } from './repository'
import type { CountryPlates, WiegandMode, WiegandResult } from './types'
import WiegandResultDisplay from './WiegandResultDisplay.vue'

const mode = ref<WiegandMode>('encode')
const input = ref<string>('')
const result = ref<WiegandResult | null>(null)
const plateLookups = ref<CountryPlates[]>([])
const plateLookupLoading = ref(false)
const supportedCountries = ref<WiegandCountry[]>([])

let convertGeneration = 0

const modes: TbOptionGroupOption[] = [
  { value: 'encode', label: 'Plate → Wiegand' },
  { value: 'decode26', label: 'Decode W26' },
  { value: 'decode64', label: 'Decode W64' },
]

const modeConfig: Record<WiegandMode, { label: string; placeholder: string }> = {
  encode: { label: 'License plate (max 10 chars)', placeholder: 'e.g. ABC 123' },
  decode26: { label: 'Wiegand 26-bit (hex or decimal)', placeholder: 'e.g. 1A98B4B or 27793227' },
  decode64: { label: 'Wiegand 64-bit hex (16 chars)', placeholder: 'e.g. 6000011C1FBD3615' },
}

onMounted(async () => {
  supportedCountries.value = await fetchSupportedCountries()
})

function clear(): void {
  convertGeneration++
  input.value = ''
  result.value = null
  plateLookups.value = []
  plateLookupLoading.value = false
}

async function convert(): Promise<void> {
  const generation = ++convertGeneration
  const wiegandResult = await processWiegand(mode.value, input.value)

  if (generation !== convertGeneration) {
    return
  }

  result.value = wiegandResult

  if (wiegandResult?.mode === 'decode26' && wiegandResult.decoded) {
    plateLookupLoading.value = true
    const results = await lookupPlatesForAllCountries(wiegandResult.decoded.wiegand26InDecimal)

    if (generation !== convertGeneration) {
      return
    }

    plateLookups.value = results
    plateLookupLoading.value = false
  } else {
    plateLookups.value = []
    plateLookupLoading.value = false
  }
}

watch(input, convert)
watch(mode, clear)
</script>

<template>
  <div class="tb-stack-6">

    <TbOptionGroup v-model="mode" :options="modes" />

    <div>
      <label class="tb-label">
        {{ modeConfig[mode].label }}
      </label>
      <TbInput v-model="input" :placeholder="modeConfig[mode].placeholder" />
    </div>

    <WiegandResultDisplay
      v-if="result"
      :result="result"
      :plate-lookups="plateLookups"
      :plate-lookup-loading="plateLookupLoading"
      :supported-countries="supportedCountries"
    />

    <TbCard v-if="mode === 'decode26'" title="Supported Countries">
      <p class="tb-text-description tb-mb-4">
        Wiegand 26-bit is lossy — multiple plates can map to the same value. When decoding, all possible plates are looked up across the countries below.
      </p>
      <div v-if="supportedCountries.length === 0" class="tb-hint">
        No countries available yet. Run the parquet generation script for at least one country.
      </div>
      <TbExpandable v-for="country in supportedCountries" :key="country.code" chevron="right">
        <template #header>
          <span class="tb-font-semibold">{{ country.code }}</span>
          <span class="tb-text-secondary tb-ml-2">{{ country.name }}</span>
        </template>
        <p class="tb-text-description">
          Plate format: <span class="tb-code-inline">{{ country.pattern }}</span>
        </p>
      </TbExpandable>
    </TbCard>
  </div>
</template>
