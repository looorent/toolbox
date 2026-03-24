<script setup lang="ts">
import { TbCard, TbCodeEditor, TbExpandable, TbInput } from '@components'
import { computed } from 'vue'
import { buildHeaderJson, OPTIONAL_HEADER_CLAIMS } from './forger-logic'
import type { ClaimEntry, SigningAlgorithm } from './forger-types'

const props = defineProps<{
  algorithm: SigningAlgorithm
  extraClaims: ClaimEntry[]
}>()

const emit = defineEmits<{
  'update:extraClaims': [value: ClaimEntry[]]
}>()

const headerJson = computed(() => buildHeaderJson(props.algorithm, props.extraClaims))

function toggleClaim(key: string, checked: boolean) {
  const updated = props.extraClaims.map(claim => {
    if (claim.key === key) {
      return { ...claim, enabled: checked }
    } else {
      return claim
    }
  })
  emit('update:extraClaims', updated)
}

function updateClaimValue(key: string, value: string) {
  const updated = props.extraClaims.map(claim => {
    if (claim.key === key) {
      return { ...claim, value }
    } else {
      return claim
    }
  })
  emit('update:extraClaims', updated)
}

function getDefinition(key: string) {
  return OPTIONAL_HEADER_CLAIMS.find(claim => claim.key === key)
}
</script>

<template>
  <TbCard sectioned title="Header" title-class="tb-text-jwt-header">
    <div class="tb-stack-4">
      <TbCodeEditor
        :model-value="headerJson"
        readonly
        copyable
        language="json"
      />

      <TbExpandable chevron="right">
        <template #header>
          <span class="tb-text-sm tb-text-secondary">Optional header claims</span>
        </template>
        <div class="tb-stack-3">
          <div v-for="claim in extraClaims" :key="claim.key" class="tb-stack-1">
            <div class="tb-row tb-row--gap-3">
              <label class="tb-checkbox">
                <input
                  type="checkbox"
                  class="tb-checkbox__input"
                  :checked="claim.enabled"
                  @change="toggleClaim(claim.key, ($event.target as HTMLInputElement).checked)"
                >
                <span class="tb-checkbox__label tb-font-semibold tb-font-mono">{{ claim.key }}</span>
              </label>
              <span class="tb-text-secondary tb-text-sm">{{ getDefinition(claim.key)?.label }}</span>
            </div>
            <template v-if="claim.enabled">
              <TbInput
                :model-value="claim.value"
                :placeholder="getDefinition(claim.key)?.placeholder"
                @update:model-value="updateClaimValue(claim.key, String($event))"
              />
              <p class="tb-hint">{{ getDefinition(claim.key)?.description }}</p>
            </template>
          </div>
        </div>
      </TbExpandable>
    </div>
  </TbCard>
</template>
