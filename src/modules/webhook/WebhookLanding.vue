<script setup lang="ts">
import { TbButton, TbEmptyState } from '@components'

defineProps<{
  isCreating: boolean
  loadError: string | null
}>()

defineEmits<{
  create: []
}>()
</script>

<template>
  <TbEmptyState
    full
    title="Webhook Catcher"
    description="Generate a unique URL and inspect every HTTP request sent to it in real time. Requests are automatically purged after 30 days of inactivity."
    :error="loadError"
  >
    <TbButton :disabled="isCreating" @click="$emit('create')">
      {{ isCreating ? 'Creating…' : 'Create New Webhook' }}
    </TbButton>
  </TbEmptyState>
</template>
