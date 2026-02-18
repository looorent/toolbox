<script setup lang="ts">
import CopyRow from '@components/CopyRow.vue'
import { computed } from 'vue'
import { validityMessage, validityStatus } from './logic'

const props = defineProps<{
  validFrom: Date
  validTo: Date
}>()

const status = computed(() => validityStatus(props.validFrom, props.validTo))
const message = computed(() => validityMessage(props.validFrom, props.validTo))
</script>

<template>
  <CopyRow
    :value="message"
    class="px-4 py-3 rounded-lg text-sm font-medium"
    :class="{
      'bg-success/10 text-success': status === 'valid',
      'bg-error/10 text-error': status === 'expired',
      'bg-warning/10 text-warning': status === 'not-yet',
    }"
  >
    {{ message }}
  </CopyRow>
</template>
