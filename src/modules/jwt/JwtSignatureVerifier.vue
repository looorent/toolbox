<script setup lang="ts">
import { TbButton, TbCard, TbFieldInput, TbInput } from '@components'
import { computed, ref } from 'vue'
import { algorithmFamily, verifyToken } from './forger-logic'
import type { SigningAlgorithm } from './forger-types'

const props = defineProps<{
  token: string
  algorithm: string
}>()

const verificationKey = ref('')
const verificationResult = ref<boolean | null>(null)
const verifying = ref(false)
const verifyError = ref<string | null>(null)

const signingAlgorithm = computed<SigningAlgorithm>(() => {
  const validAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'PS256', 'PS384', 'PS512', 'EdDSA', 'none']
  if (validAlgorithms.includes(props.algorithm)) {
    return props.algorithm as SigningAlgorithm
  } else {
    return 'HS256'
  }
})

const family = computed(() => algorithmFamily(signingAlgorithm.value))

const isNone = computed(() => signingAlgorithm.value === 'none')
const isHmac = computed(() => family.value === 'hmac')

async function verify() {
  verifying.value = true
  verifyError.value = null
  verificationResult.value = null
  try {
    verificationResult.value = await verifyToken(props.token, signingAlgorithm.value, verificationKey.value)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed'
    verifyError.value = message
  } finally {
    verifying.value = false
  }
}
</script>

<template>
  <TbCard sectioned title="Signature Verification" title-class="tb-text-jwt-signature">
    <div v-if="isNone" class="tb-hint">
      This token uses algorithm "none" — there is no signature to verify.
    </div>

    <div v-else class="tb-stack-3">
      <p class="tb-hint">
        Verify the token's signature using the {{ isHmac ? 'shared secret' : 'public key' }}.
        Algorithm: <span class="tb-font-mono tb-font-semibold">{{ signingAlgorithm }}</span>
      </p>

      <TbInput
        v-if="isHmac"
        v-model="verificationKey"
        placeholder="Enter the secret used to sign this token"
      />
      <TbFieldInput
        v-else
        v-model="verificationKey"
        label="Public key"
        multiline
        :rows="4"
        placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
      />

      <div class="tb-row tb-row--gap-3">
        <TbButton
          variant="secondary"
          size="sm"
          :disabled="!verificationKey.trim() || verifying"
          @click="verify"
        >
          {{ verifying ? 'Verifying...' : 'Verify signature' }}
        </TbButton>

        <span
          v-if="verificationResult === true"
          class="tb-badge tb-badge--valid"
        >Signature valid</span>
        <span
          v-else-if="verificationResult === false"
          class="tb-badge tb-badge--invalid"
        >Signature invalid</span>
        <span
          v-else-if="verifyError"
          class="tb-badge tb-badge--invalid"
        >{{ verifyError }}</span>
      </div>

      <p class="tb-hint">
        Verification checks that the signature matches the header and payload using the provided key.
        It does not validate claims like expiration or audience.
      </p>
    </div>
  </TbCard>
</template>
