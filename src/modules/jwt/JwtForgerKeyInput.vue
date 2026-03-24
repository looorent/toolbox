<script setup lang="ts">
import { TbButton, TbCodeEditor, TbExpandable, TbFieldInput } from '@components'
import { computed, ref, watch } from 'vue'
import { algorithmFamily, buildJwks, generateKeyPair, getKeyGenerationCommand } from './forger-logic'
import type { AlgorithmFamily, SigningAlgorithm } from './forger-types'

const props = defineProps<{
  algorithm: SigningAlgorithm
  secret: string
  privateKey: string
  kid: string | null
}>()

const emit = defineEmits<{
  'update:secret': [value: string]
  'update:privateKey': [value: string]
}>()

const family = computed<AlgorithmFamily>(() => algorithmFamily(props.algorithm))
const keyCommand = computed(() => getKeyGenerationCommand(family.value, props.algorithm))

const generating = ref(false)
const publicKey = ref<string | null>(null)
const generateError = ref<string | null>(null)

type PublicKeyView = 'pem' | 'jwks'
const publicKeyView = ref<PublicKeyView>('pem')
const jwksJson = ref<string | null>(null)
const jwksError = ref<string | null>(null)

async function computeJwks() {
  if (!publicKey.value) {
    jwksJson.value = null
    return
  }
  try {
    jwksJson.value = await buildJwks(publicKey.value, props.algorithm, props.kid || undefined)
    jwksError.value = null
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to build JWKS'
    jwksError.value = message
    jwksJson.value = null
  }
}

watch([publicKey, () => props.algorithm, () => props.kid], () => {
  if (publicKeyView.value === 'jwks' && publicKey.value) {
    computeJwks()
  }
})

function setPublicKeyView(view: PublicKeyView) {
  publicKeyView.value = view
  if (view === 'jwks' && publicKey.value && !jwksJson.value) {
    computeJwks()
  }
}

function generateRandomSecret() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const secret = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  emit('update:secret', secret)
}

async function generateSampleKeyPair() {
  generating.value = true
  generateError.value = null
  publicKey.value = null
  try {
    const keyPair = await generateKeyPair(props.algorithm)
    emit('update:privateKey', keyPair.privateKeyPem)
    publicKey.value = keyPair.publicKeyPem
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Key generation failed'
    generateError.value = message
  } finally {
    generating.value = false
  }
}
</script>

<template>
  <div v-if="family === 'none'" class="tb-alert tb-alert--info">
    No signing key needed — the token will have an empty signature.
  </div>

  <div v-else-if="family === 'hmac'" class="tb-stack-3">
    <TbFieldInput
      :model-value="secret"
      label="Secret key"
      placeholder="your-256-bit-secret"
      @update:model-value="emit('update:secret', String($event))"
    >
      <template #actions>
        <TbButton variant="secondary" size="sm" @click="generateRandomSecret">Random</TbButton>
      </template>
    </TbFieldInput>
    <p class="tb-hint">
      The same secret must be known by both the token issuer and verifier.
      For HS256, use at least 32 bytes. For HS384, at least 48 bytes. For HS512, at least 64 bytes.
    </p>
  </div>

  <div v-else class="tb-stack-3">
    <TbFieldInput
      :model-value="privateKey"
      label="Private key (PEM, PKCS#8)"
      multiline
      :rows="6"
      placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
      @update:model-value="emit('update:privateKey', String($event))"
    >
      <template #actions>
        <TbButton variant="secondary" size="sm" :disabled="generating" @click="generateSampleKeyPair">
          {{ generating ? 'Generating...' : 'Generate' }}
        </TbButton>
      </template>
    </TbFieldInput>

    <div v-if="generateError" class="tb-alert tb-alert--error">{{ generateError }}</div>

    <div v-if="publicKey" class="tb-stack-2">
      <div class="tb-row tb-row--between">
        <label class="tb-label">Public key (for verification)</label>
        <div class="tb-row tb-row--gap-1">
          <button
            v-for="view in (['pem', 'jwks'] as const)"
            :key="view"
            type="button"
            class="tb-btn-mini"
            :class="{ 'tb-btn-mini--active': publicKeyView === view }"
            @click="setPublicKeyView(view)"
          >
            {{ view === 'pem' ? 'PEM' : 'JWKS' }}
          </button>
        </div>
      </div>
      <TbCodeEditor
        v-if="publicKeyView === 'pem'"
        :model-value="publicKey"
        readonly
        copyable
      />
      <template v-else>
        <div v-if="jwksError" class="tb-alert tb-alert--error">{{ jwksError }}</div>
        <TbCodeEditor
          v-else-if="jwksJson"
          :model-value="jwksJson"
          readonly
          copyable
          language="json"
        />
      </template>
      <p class="tb-hint">Save this public key — it won't be shown again after you generate a new pair.</p>
    </div>

    <TbExpandable chevron="right">
      <template #header>
        <span class="tb-text-sm tb-text-secondary">Generate with OpenSSL instead</span>
      </template>
      <div class="tb-stack-2">
        <p class="tb-hint">Generate a PKCS#8 private key using OpenSSL:</p>
        <code class="tb-code-block tb-text-xs">{{ keyCommand }}</code>
        <p class="tb-hint">Extract the public key:</p>
        <code class="tb-code-block tb-text-xs">openssl pkey -in private.pem -pubout -out public.pem</code>
        <p class="tb-hint">
          The private key must be in PKCS#8 format (header: "BEGIN PRIVATE KEY").
          If you have a PKCS#1 RSA key ("BEGIN RSA PRIVATE KEY"), convert it:
        </p>
        <code class="tb-code-block tb-text-xs">openssl pkcs8 -topk8 -nocrypt -in rsa.pem -out private.pem</code>
      </div>
    </TbExpandable>
  </div>
</template>
