<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  algorithmFamily,
  applyPreset,
  buildHeaderJson,
  buildPayloadJson,
  generateDefaultClaims,
  OPTIONAL_HEADER_CLAIMS,
  signToken,
} from './forger-logic'
import type { ClaimEntry, SigningAlgorithm, TokenPreset } from './forger-types'
import JwtForgerAlgorithmSection from './JwtForgerAlgorithmSection.vue'
import JwtForgerHeaderEditor from './JwtForgerHeaderEditor.vue'
import JwtForgerKeyInput from './JwtForgerKeyInput.vue'
import JwtForgerOutput from './JwtForgerOutput.vue'
import JwtForgerPayloadEditor from './JwtForgerPayloadEditor.vue'
import JwtForgerPresetBar from './JwtForgerPresetBar.vue'

const algorithm = ref<SigningAlgorithm>('HS256')
const standardClaims = ref<ClaimEntry[]>(generateDefaultClaims())
const customClaims = ref<ClaimEntry[]>([])
const headerExtraClaims = ref<ClaimEntry[]>(
  OPTIONAL_HEADER_CLAIMS.map(claim => ({ key: claim.key, value: '', enabled: false })),
)
const secret = ref('your-256-bit-secret')
const privateKey = ref('')

const kidValue = computed(() => {
  const kidClaim = headerExtraClaims.value.find(claim => claim.key === 'kid')
  return kidClaim?.enabled && kidClaim.value.trim() ? kidClaim.value.trim() : null
})

function loadPreset(preset: TokenPreset) {
  const result = applyPreset(preset)
  algorithm.value = result.algorithm
  standardClaims.value = result.standardClaims
  customClaims.value = result.customClaims
}

const generatedToken = ref('')
const signingError = ref<string | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  [algorithm, standardClaims, customClaims, headerExtraClaims, secret, privateKey],
  () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
      regenerateToken()
    }, 150)
  },
  { deep: true },
)

async function regenerateToken() {
  try {
    const headerJson = buildHeaderJson(algorithm.value, headerExtraClaims.value)
    const payloadJson = buildPayloadJson(standardClaims.value, customClaims.value)
    const family = algorithmFamily(algorithm.value)

    const key = family === 'hmac' ? secret.value : privateKey.value

    if (family !== 'none' && family !== 'hmac' && !key.trim()) {
      generatedToken.value = ''
      signingError.value = null
      return
    }

    const token = await signToken(headerJson, payloadJson, algorithm.value, key)
    generatedToken.value = token
    signingError.value = null
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown signing error'
    signingError.value = message
    generatedToken.value = ''
  }
}

regenerateToken()
</script>

<template>
  <div class="tb-stack-6">
    <JwtForgerPresetBar @select="loadPreset" />

    <JwtForgerAlgorithmSection v-model="algorithm" />

    <JwtForgerHeaderEditor
      :algorithm="algorithm"
      :extra-claims="headerExtraClaims"
      @update:extra-claims="headerExtraClaims = $event"
    />

    <JwtForgerPayloadEditor
      :standard-claims="standardClaims"
      :custom-claims="customClaims"
      @update:standard-claims="standardClaims = $event"
      @update:custom-claims="customClaims = $event"
    />

    <JwtForgerKeyInput
      :algorithm="algorithm"
      :secret="secret"
      :private-key="privateKey"
      :kid="kidValue"
      @update:secret="secret = $event"
      @update:private-key="privateKey = $event"
    />

    <JwtForgerOutput :token="generatedToken" :error="signingError" />
  </div>
</template>
