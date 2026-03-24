<script setup lang="ts">
import { TbButton, TbCard } from '@components'
import { computed } from 'vue'
import JwtTokenDisplay from './JwtTokenDisplay.vue'

const props = defineProps<{
  token: string
  error: string | null
}>()

const parts = computed<[string, string, string]>(() => {
  const segments = props.token.split('.')
  return [segments[0] ?? '', segments[1] ?? '', segments[2] ?? '']
})

const tokenSize = computed(() => new TextEncoder().encode(props.token).length)

function openInDecoder() {
  const url = `/jwt?token=${encodeURIComponent(props.token)}`
  window.open(url, '_blank')
}
</script>

<template>
  <TbCard sectioned title="Generated Token">
    <div class="tb-stack-4">
      <div v-if="error" class="tb-alert tb-alert--error">
        {{ error }}
      </div>

      <template v-else-if="token">
        <JwtTokenDisplay :parts="parts" :raw-token="token" />

        <div class="tb-row tb-row--gap-3 tb-row--between">
          <span class="tb-hint">{{ tokenSize }} bytes</span>
          <TbButton variant="secondary" size="sm" @click="openInDecoder">Open in Decoder</TbButton>
        </div>
      </template>

      <div v-else class="tb-empty-text">
        Configure the token above to generate a JWT.
      </div>
    </div>
  </TbCard>
</template>
