<script setup lang="ts">
export type TbStatusBannerStatus = 'valid' | 'expired' | 'not-yet'

defineProps<{
  status: TbStatusBannerStatus
  message: string
}>()
</script>

<template>
  <div
    role="status"
    class="tb-alert tb-font-medium"
    :class="{
      'tb-status-valid': status === 'valid',
      'tb-status-expired': status === 'expired',
      'tb-status-not-yet': status === 'not-yet',
    }"
  >
    {{ message }}
  </div>
</template>
