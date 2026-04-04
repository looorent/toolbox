<script setup lang="ts">
import { TbInput, TbStatCard } from '@components'
import { computed, ref } from 'vue'
import { detectUuidVersion, extractV7Timestamp, isValidUuid } from './logic'

const input = ref('')
const trimmed = computed(() => input.value.trim())
const isValid = computed(() => trimmed.value ? isValidUuid(trimmed.value) : null)
const detectedVersion = computed(() => isValid.value ? detectUuidVersion(trimmed.value) : null)
const v7Info = computed(() => detectedVersion.value === 'v7' ? extractV7Timestamp(trimmed.value) : null)
</script>

<template>
  <div class="tb-stack-4">
    <div class="tb-stack-2">
      <label class="tb-section-title">Analyze UUID</label>
      <TbInput
        v-model="input"
        placeholder="Paste a UUID to analyze..."
        :class="{ 'tb-input--error': isValid === false }"
      />
    </div>

    <template v-if="isValid && detectedVersion">
      <div class="tb-row tb-row--gap-3">
        <span class="tb-badge tb-badge--accent">{{ detectedVersion.toUpperCase() }}</span>
        <span v-if="detectedVersion === 'v7'" class="tb-text-description">Time-ordered UUID</span>
        <span v-else class="tb-text-description">Random UUID</span>
      </div>

      <div v-if="v7Info" class="tb-grid-2">
        <TbStatCard title="ISO 8601" :value="v7Info.iso" />
        <TbStatCard title="UTC" :value="v7Info.utc" />
        <TbStatCard title="Local" :value="v7Info.local" />
        <TbStatCard title="Timestamp (ms)" :value="String(v7Info.timestamp)" />
      </div>
    </template>

    <p v-else-if="isValid === false" class="tb-text-description tb-text-error">
      Not a valid UUID format
    </p>
  </div>
</template>
