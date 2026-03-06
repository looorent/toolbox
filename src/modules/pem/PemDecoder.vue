<script setup lang="ts">
import { TbButton, TbFieldInput, TbStatCard } from '@components'
import { computed, ref } from 'vue'
import { decodePem, SAMPLE_PEM } from './logic'
import PemCertificateDetails from './PemCertificateDetails.vue'

const pem = ref('')
const decoded = computed(() => pem.value.trim() ? decodePem(pem.value) : null)
const emptyDer = new Uint8Array()

function loadSample() {
  pem.value = SAMPLE_PEM
}
</script>

<template>
  <div class="tb-stack-6">
    <TbFieldInput
      v-model="pem"
      label="Paste PEM-encoded certificate"
      multiline
      :rows="8"
      placeholder="-----BEGIN CERTIFICATE-----&#10;MIIBoj..."
    >
      <template #actions>
        <TbButton v-if="!pem.trim()" variant="secondary" size="sm" @click="loadSample">Load sample</TbButton>
      </template>
    </TbFieldInput>

    <template v-if="decoded">
      <div v-if="decoded.error" role="alert" class="tb-alert tb-alert--error">
        {{ decoded.error }}
      </div>

      <!-- Non-certificate PEM -->
      <template v-else-if="!decoded.cert">
        <div class="tb-grid-2">
          <TbStatCard title="Type" :value="decoded.type ?? ''" />
          <TbStatCard title="Size" :value="`${decoded.byteLength}`">
            <p class="tb-text-sm tb-font-mono tb-font-medium tb-text-primary">{{ decoded.byteLength }} bytes</p>
          </TbStatCard>
        </div>
      </template>

      <PemCertificateDetails v-else :cert="decoded.cert" :der="decoded.der ?? emptyDer" />
    </template>
  </div>
</template>
