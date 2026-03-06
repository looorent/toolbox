<script setup lang="ts">
import { TbSearchableDropdown } from '@components'

defineProps<{
  timezones: string[]
}>()

const selectedTimezone = defineModel<string>({ required: true })
</script>

<template>
  <TbSearchableDropdown v-model="selectedTimezone" :options="timezones" placeholder="Search timezones...">
    <template #icon>
      <svg class="tb-icon-xs tb-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-width="2" /><path stroke-width="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" /></svg>
    </template>
  </TbSearchableDropdown>
</template>
