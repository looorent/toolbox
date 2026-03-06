<script setup lang="ts">
import { TbOptionGroup, type TbOptionGroupOption } from '@components'
import type { XorInputFormat } from './types'

const model = defineModel<XorInputFormat>({ required: true })

const options: TbOptionGroupOption[] = [
  { value: 'hex', label: 'Hex' },
  { value: 'ascii', label: 'ASCII' },
]
</script>

<template>
  <TbOptionGroup v-model="model" :options="options" />
</template>
