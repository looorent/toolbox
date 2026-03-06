<script setup lang="ts">
import { TbFieldInput } from '@components'

defineProps<{
  error: boolean
}>()

const pathData = defineModel<string>({ required: true })
</script>

<template>
  <TbFieldInput
    v-model="pathData"
    label="Path Data"
    multiline
    :rows="4"
    placeholder="M10 10 L90 10 L90 90 L10 90 Z"
    :error="error"
    error-message="Invalid path — must start with M/m and contain valid SVG path commands."
  />
</template>
