<script setup lang="ts">
import { TbCard, TbKvTable, TbStatCard, TbTag } from '@components'
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
  <div class="tb-stack-6">
    <PemValidityBanner :valid-from="cert.validFrom" :valid-to="cert.validTo" />

    <div class="tb-grid-3">
      <TbStatCard title="Version" :value="`v${cert.version}`" />
      <TbStatCard title="Key" :value="keyDescription(cert)">
        <p class="tb-text-sm tb-font-mono tb-font-medium tb-text-primary">
          {{ cert.publicKeyAlgorithm }}
          <template v-if="cert.publicKeySize"> {{ cert.publicKeySize }} bits</template>
          <template v-if="cert.publicKeyCurve"> ({{ cert.publicKeyCurve }})</template>
        </p>
      </TbStatCard>
      <TbStatCard title="Signature" :value="cert.signatureAlgorithm" />
    </div>

    <PemDistinguishedName title="Subject" :parts="cert.subject.parts" />

    <TbCard v-if="cert.subjectAltNames.length" title="Subject Alternative Names" class="tb-stack-3">
      <div class="tb-row tb-row--wrap">
        <TbTag
          v-for="san in cert.subjectAltNames"
          :key="san"
          :copyable="san"
          size="sm"
        >
          {{ san }}
        </TbTag>
      </div>
    </TbCard>

    <PemDistinguishedName title="Issuer" :parts="cert.issuer.parts" />

    <TbCard title="Validity">
      <TbKvTable
        :entries="[
          { key: 'Valid From', value: formatDate(cert.validFrom) },
          { key: 'Valid To', value: formatDate(cert.validTo) },
          { key: 'Serial Number', value: cert.serialNumber },
        ]"
        copyable
        key-size="sm"
      />
    </TbCard>

    <PemExtensions
      :basic-constraints="cert.basicConstraints"
      :key-usage="cert.keyUsage"
      :extended-key-usage="cert.extendedKeyUsage"
    />

    <PemFingerprints :der="der" />
  </div>
</template>
