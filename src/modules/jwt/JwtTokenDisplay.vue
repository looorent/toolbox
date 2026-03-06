<script setup lang="ts">
import { TbCopyRow } from '@components'

defineProps<{
  parts: [string, string, string]
  rawToken: string
}>()
</script>

<template>
  <TbCopyRow
    :value="rawToken"
    class="tb-code-block tb-break-all tb-block tb-leading-relaxed"
  >
    <span class="tb-text-jwt-header">{{ parts[0] }}</span><span class="tb-text-muted">.</span><span class="tb-text-jwt-payload">{{ parts[1] }}</span><span class="tb-text-muted">.</span><span class="tb-text-jwt-signature">{{ parts[2] }}</span>
  </TbCopyRow>
</template>
