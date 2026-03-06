<script setup lang="ts">
import { TbCard, TbCopyRow } from '@components'

defineProps<{
  signature: string
}>()
</script>

<template>
  <TbCard sectioned title="Signature" title-class="tb-text-jwt-signature">
    <TbCopyRow :value="signature">
      <code class="tb-text-sm tb-font-mono tb-text-muted tb-break-all">{{ signature }}</code>
    </TbCopyRow>
  </TbCard>
</template>
