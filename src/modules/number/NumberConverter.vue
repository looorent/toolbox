<script setup lang="ts">
import { TbFieldInput } from '@components'
import { type Ref, ref, watch } from 'vue'
import { convertNumber } from './logic'
import type { Radix } from './types'

interface NumberField {
  label: string
  model: Ref<string>
  placeholder: string
  key: string
  radix: Radix
  inputmode: 'numeric' | 'text'
}

const decimal = ref<string>('')
const hex = ref<string>('')
const binary = ref<string>('')
const octal = ref<string>('')
const updating = ref<boolean>(false)

function updateFormats(newValue: string, radix: Radix, sourceRef: Ref<string>) {
  if (!updating.value) {
    updating.value = true

    const result = convertNumber(newValue, radix)

    if (sourceRef !== decimal) {
      decimal.value = result.decimal
    }
    if (sourceRef !== hex) {
      hex.value = result.hex
    }
    if (sourceRef !== binary) {
      binary.value = result.binary
    }
    if (sourceRef !== octal) {
      octal.value = result.octal
    }

    requestAnimationFrame(() => updating.value = false)
  }
}

const fields: NumberField[] = [
  { label: 'Decimal (base 10)', model: decimal, placeholder: '255', key: 'dec', radix: 10, inputmode: 'numeric' },
  { label: 'Hexadecimal (base 16)', model: hex, placeholder: 'FF', key: 'hex', radix: 16, inputmode: 'text' },
  { label: 'Binary (base 2)', model: binary, placeholder: '11111111', key: 'bin', radix: 2, inputmode: 'text' },
  { label: 'Octal (base 8)', model: octal, placeholder: '377', key: 'oct', radix: 8, inputmode: 'numeric' },
]

for (const field of fields) {
  watch(field.model, newValue => updateFormats(newValue, field.radix, field.model))
}
</script>

<template>
  <div class="tb-stack-6">
    <p class="tb-text-description">Type a value in any field and the others update automatically.</p>

    <div class="tb-grid-2">
      <TbFieldInput
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        v-model="field.model.value"
        :placeholder="field.placeholder"
        :inputmode="field.inputmode"
        copyable
      />
    </div>
  </div>
</template>
