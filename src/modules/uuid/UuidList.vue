<script setup lang="ts">
import CopyCodeRow from '@components/CopyCodeRow.vue'

defineProps<{
  uuids: string[]
}>()
</script>

<template>
  <div class="space-y-2">
    <CopyCodeRow
      v-for="(uuid, uuidIndex) in uuids"
      :key="uuidIndex"
      :value="uuid"
    />
  </div>
</template>
