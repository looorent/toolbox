<script setup lang="ts">
import { TbCopyRow } from '@components'

defineProps<{
  uuids: string[]
}>()
</script>

<template>
  <div class="tb-stack-2">
    <TbCopyRow
      v-for="(uuid, uuidIndex) in uuids"
      :key="uuidIndex"
      :value="uuid"
    >
      <code class="tb-text-sm tb-font-mono tb-text-primary">{{ uuid }}</code>
    </TbCopyRow>
  </div>
</template>
