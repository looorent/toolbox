<script setup lang="ts">
import { TbCard, TbExpandable, TbInput, TbOptionGroup, type TbOptionGroupOption } from '@components'
import type { WiegandCountry } from '@shared/modules/wiegand/countries'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { processWiegand } from './logic'
import { fetchSupportedCountries, lookupPlatesForAllCountries } from './repository'
import type { CountryPlates, Decode26InputFormat, WiegandMode, WiegandResult } from './types'
import WiegandResultDisplay from './WiegandResultDisplay.vue'

const mode = ref<WiegandMode>('encode')
const decode26Format = ref<Decode26InputFormat>('decimal')
const input = ref<string>('')
const result = ref<WiegandResult | null>(null)
const plateLookups = ref<CountryPlates[]>([])
const plateLookupLoading = ref(false)
const supportedCountries = ref<WiegandCountry[]>([])

let convertGeneration = 0
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let abortController: AbortController | null = null

const modes: TbOptionGroupOption[] = [
  { value: 'encode', label: 'Plate → Wiegand' },
  { value: 'decode26', label: 'Decode W26' },
  { value: 'decode64', label: 'Decode W64' },
]

const decode26Formats: TbOptionGroupOption[] = [
  { value: 'decimal', label: 'Decimal' },
  { value: 'hex', label: 'Hexadecimal' },
  { value: 'plate', label: 'Similar plates' },
]

const inputConfig: Record<WiegandMode, { label: string; placeholder: string }> = {
  encode: { label: 'License plate (max 10 chars)', placeholder: 'e.g. ABC 123' },
  decode26: { label: '', placeholder: '' },
  decode64: { label: 'Wiegand 64-bit hex (16 chars)', placeholder: 'e.g. 6000011C1FBD3615' },
}

const decode26InputConfig: Record<Decode26InputFormat, { label: string; placeholder: string }> = {
  decimal: { label: 'Wiegand 26-bit decimal value', placeholder: 'e.g. 9132458' },
  hex: { label: 'Wiegand 26-bit hexadecimal value', placeholder: 'e.g. 1A98B4B' },
  plate: { label: 'License plate to find collisions for', placeholder: 'e.g. ABC123' },
}

onMounted(async () => {
  supportedCountries.value = await fetchSupportedCountries()
})

onUnmounted(cancelPending)

function cancelPending(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  if (abortController) {
    abortController.abort()
    abortController = null
  }
}

function clearInput(): void {
  cancelPending()
  convertGeneration++
  input.value = ''
  result.value = null
  plateLookups.value = []
  plateLookupLoading.value = false
}

function clearAll(): void {
  decode26Format.value = 'decimal'
  clearInput()
}

const DEBOUNCE_MS = 300

async function convert(): Promise<void> {
  cancelPending()
  const generation = ++convertGeneration
  const wiegandResult = await processWiegand(mode.value, input.value, decode26Format.value)

  if (generation !== convertGeneration) {
    return
  }

  result.value = wiegandResult

  if (wiegandResult?.mode === 'decode26' && wiegandResult.decoded) {
    plateLookupLoading.value = true
    abortController = new AbortController()
    const results = await lookupPlatesForAllCountries(wiegandResult.decoded.wiegand26InDecimal, abortController.signal)

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

function debouncedConvert(): void {
  cancelPending()
  debounceTimer = setTimeout(convert, DEBOUNCE_MS)
}

watch(input, debouncedConvert)
watch(mode, clearAll)
watch(decode26Format, clearInput)
</script>

<template>
  <div class="tb-stack-6">

    <TbOptionGroup v-model="mode" :options="modes" />

    <TbOptionGroup
      v-if="mode === 'decode26'"
      v-model="decode26Format"
      :options="decode26Formats"
      variant="segmented"
      label="Input format"
      size="sm"
    />

    <div>
      <label class="tb-label">
        {{ mode === 'decode26' ? decode26InputConfig[decode26Format].label : inputConfig[mode].label }}
      </label>
      <TbInput
        v-model="input"
        :placeholder="mode === 'decode26' ? decode26InputConfig[decode26Format].placeholder : inputConfig[mode].placeholder"
      />
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
