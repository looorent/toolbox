<script setup lang="ts">
import CopyStatCard from '@components/CopyStatCard.vue'
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
  <div class="space-y-6">
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm text-text-secondary">Paste PEM-encoded certificate</label>
        <button
          v-if="!pem.trim()"
          type="button"
          class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-overlay text-text-secondary hover:text-text-primary border border-border transition-colors"
          @click="loadSample"
        >
          Load sample
        </button>
      </div>
      <textarea
        v-model="pem"
        placeholder="-----BEGIN CERTIFICATE-----&#10;MIIBoj..."
        rows="8"
        class="w-full bg-surface-overlay border border-border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition-colors resize-y"
      />
    </div>

    <template v-if="decoded">
      <div v-if="decoded.error" class="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-sm text-error">
        {{ decoded.error }}
      </div>

      <!-- Non-certificate PEM -->
      <template v-else-if="!decoded.cert">
        <div class="grid grid-cols-2 gap-4">
          <CopyStatCard title="Type" :value="decoded.type ?? ''" />
          <CopyStatCard title="Size" :value="`${decoded.byteLength}`">
            <p class="text-sm font-mono font-medium text-text-primary">{{ decoded.byteLength }} bytes</p>
          </CopyStatCard>
        </div>
      </template>

      <!-- Certificate details -->
      <PemCertificateDetails v-else :cert="decoded.cert" :der="decoded.der ?? emptyDer" />
    </template>
  </div>
</template>
