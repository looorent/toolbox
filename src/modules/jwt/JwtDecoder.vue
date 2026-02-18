<script setup lang="ts">
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
  <div class="space-y-6">
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm text-text-secondary">Paste JWT token</label>
        <button
          v-if="!token.trim()"
          type="button"
          class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-overlay text-text-secondary hover:text-text-primary border border-border transition-colors"
          @click="loadSample"
        >
          Load sample
        </button>
      </div>
      <textarea
        v-model="token"
        placeholder="eyJhbGciOiJIUzI1NiIs..."
        rows="4"
        class="w-full bg-surface-overlay border border-border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition-colors resize-y"
      />
    </div>

    <template v-if="decoded">
      <div v-if="decoded.kind === 'error'" class="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-sm text-error">
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
          color="text-red-400"
          :data="decoded.header"
          :labels="HEADER_LABELS"
          :format-value="formatHeaderValue"
        />

        <JwtClaimSection
          title="Payload"
          color="text-purple-400"
          :data="decoded.payload"
          :labels="CLAIM_LABELS"
          :format-value="formatClaimValue"
        />

        <JwtSignatureSection v-if="decoded.signature" :signature="decoded.signature" />
      </template>
    </template>
  </div>
</template>
