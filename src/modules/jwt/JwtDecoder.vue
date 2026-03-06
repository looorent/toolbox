<script setup lang="ts">
import { TbButton, TbFieldInput } from '@components'
import { computed, ref } from 'vue'
import JwtClaimSection from './JwtClaimSection.vue'
import JwtExpirationBanner from './JwtExpirationBanner.vue'
import JwtSignatureSection from './JwtSignatureSection.vue'
import JwtTokenDisplay from './JwtTokenDisplay.vue'
import { CLAIM_LABELS, decodeJwt, formatClaimValue, formatHeaderValue, HEADER_LABELS, SAMPLE_JWT } from './logic'

const token = ref('')

const decoded = computed(() => decodeJwt(token.value))

function loadSample() {
  token.value = SAMPLE_JWT
}
</script>

<template>
  <div class="tb-stack-6">
    <TbFieldInput
      v-model="token"
      label="Paste JWT token"
      multiline
      :rows="4"
      placeholder="eyJhbGciOiJIUzI1NiIs..."
    >
      <template #actions>
        <TbButton v-if="!token.trim()" variant="secondary" size="sm" @click="loadSample">Load sample</TbButton>
      </template>
    </TbFieldInput>

    <template v-if="decoded">
      <div v-if="decoded.kind === 'error'" role="alert" class="tb-alert tb-alert--error">
        {{ decoded.message }}
      </div>

      <template v-else>
        <JwtTokenDisplay :parts="decoded.parts" :raw-token="token.trim()" />

        <JwtExpirationBanner
          v-if="decoded.expInfo"
          :exp-status="decoded.expStatus"
          :exp-info="decoded.expInfo"
        />

        <JwtClaimSection
          title="Header"
          color="tb-text-jwt-header"
          :data="decoded.header"
          :labels="HEADER_LABELS"
          :format-value="formatHeaderValue"
        />

        <JwtClaimSection
          title="Payload"
          color="tb-text-jwt-payload"
          :data="decoded.payload"
          :labels="CLAIM_LABELS"
          :format-value="formatClaimValue"
        />

        <JwtSignatureSection v-if="decoded.signature" :signature="decoded.signature" />
      </template>
    </template>
  </div>
</template>
