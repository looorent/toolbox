<script setup lang="ts">
import CopyStatCard from '@components/CopyStatCard.vue'
import CopyText from '@components/CopyText.vue'
import { formatDate, keyDescription } from './logic'
import PemDistinguishedName from './PemDistinguishedName.vue'
import PemExtensions from './PemExtensions.vue'
import PemFingerprints from './PemFingerprints.vue'
import PemValidityBanner from './PemValidityBanner.vue'
import type { CertificateInfo } from './types'

defineProps<{
  cert: CertificateInfo
  der: Uint8Array
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Validity banner -->
    <PemValidityBanner :valid-from="cert.validFrom" :valid-to="cert.validTo" />

    <!-- Summary cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <CopyStatCard title="Version" :value="`v${cert.version}`" />
      <CopyStatCard title="Key" :value="keyDescription(cert)">
        <p class="text-sm font-mono font-medium text-text-primary">
          {{ cert.publicKeyAlgorithm }}
          <template v-if="cert.publicKeySize"> {{ cert.publicKeySize }} bits</template>
          <template v-if="cert.publicKeyCurve"> ({{ cert.publicKeyCurve }})</template>
        </p>
      </CopyStatCard>
      <CopyStatCard title="Signature" :value="cert.signatureAlgorithm" />
    </div>

    <!-- Subject -->
    <PemDistinguishedName title="Subject" :parts="cert.subject.parts" />

    <!-- Subject Alternative Names -->
    <div v-if="cert.subjectAltNames.length" class="bg-surface-overlay border border-border rounded-lg p-4 space-y-3">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Subject Alternative Names</h3>
      <div class="flex flex-wrap gap-2">
        <CopyText
          v-for="san in cert.subjectAltNames"
          :key="san"
          :value="san"
          class="inline-block bg-surface-base border border-border rounded px-2 py-1 text-sm font-mono text-text-primary hover:border-border-focus transition-colors"
        />
      </div>
    </div>

    <!-- Issuer -->
    <PemDistinguishedName title="Issuer" :parts="cert.issuer.parts" />

    <!-- Validity Period -->
    <div class="bg-surface-overlay border border-border rounded-lg p-4 space-y-3">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Validity Period</h3>
      <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <span class="text-text-muted">Valid From</span>
        <CopyText :value="formatDate(cert.validFrom)" class="font-mono text-text-primary" />
        <span class="text-text-muted">Valid To</span>
        <CopyText :value="formatDate(cert.validTo)" class="font-mono text-text-primary" />
      </div>
    </div>

    <!-- Serial Number -->
    <CopyStatCard title="Serial Number" :value="cert.serialNumber" value-class="text-sm font-mono text-text-primary break-all" />

    <!-- Extensions -->
    <PemExtensions
      :basic-constraints="cert.basicConstraints"
      :key-usage="cert.keyUsage"
      :extended-key-usage="cert.extendedKeyUsage"
    />

    <!-- Fingerprints -->
    <PemFingerprints :der="der" />
  </div>
</template>
