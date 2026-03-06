<script setup lang="ts">
import { TbStatusBanner } from '@components'
import { computed } from 'vue';
import { validityMessage, validityStatus } from './logic';

const props = defineProps<{
  validFrom: Date
  validTo: Date
}>()

const status = computed(() => validityStatus(props.validFrom, props.validTo))
const message = computed(() => validityMessage(props.validFrom, props.validTo))
</script>

<template>
  <TbStatusBanner :status="status" :message="message" />
</template>
