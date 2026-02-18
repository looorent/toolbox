<script setup lang="ts">
import type { DecodedJwtSuccess } from './types'

defineProps<{
  expStatus: DecodedJwtSuccess['expStatus']
  expInfo: string
}>()
</script>

<template>
  <div
    class="px-4 py-3 rounded-lg text-sm font-medium"
    :class="{
      'bg-success/10 text-success': expStatus === 'valid',
      'bg-error/10 text-error': expStatus === 'expired',
      'bg-warning/10 text-warning': expStatus === 'not-yet',
    }"
  >
    {{ expInfo }}
  </div>
</template>
