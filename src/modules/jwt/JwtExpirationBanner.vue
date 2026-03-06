<script setup lang="ts">
import { TbStatusBanner } from '@components'
import type { DecodedJwtSuccess } from './types'

defineProps<{
  expStatus: DecodedJwtSuccess['expStatus']
  expInfo: string
}>()
</script>

<template>
  <TbStatusBanner v-if="expStatus" :status="expStatus" :message="expInfo" />
</template>
