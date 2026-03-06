<script setup lang="ts">
import { TbButton } from '@components'
import { useCopy } from '@composables/useCopy'
import type { JsonValidationResult } from './types'

const props = defineProps<{
  result: JsonValidationResult
}>()

const emit = defineEmits<{
  format: []
  minify: []
  loadSample: []
  applyFix: []
}>()

const { copy, copiedKey } = useCopy()

function copyFormatted() {
  if (props.result.kind === 'valid') {
    copy('json', props.result.formatted)
  }
}
</script>

<template>
  <div class="tb-row tb-row--gap-2 tb-row--wrap">
    <template v-if="result.kind === 'valid'">
      <TbButton variant="secondary" size="sm" @click="emit('format')">Prettify</TbButton>
      <TbButton variant="secondary" size="sm" @click="emit('minify')">Minify</TbButton>
      <TbButton :variant="copiedKey === 'json' ? 'primary' : 'secondary'" size="sm" @click="copyFormatted">
        {{ copiedKey === 'json' ? 'Copied!' : 'Copy' }}
      </TbButton>
    </template>

    <template v-if="result.kind === 'invalid' && result.fixedJson">
      <TbButton variant="primary" size="sm" @click="emit('applyFix')">Apply fix</TbButton>
      <span class="tb-text-xs tb-text-secondary">{{ result.fixSummary.join(', ') }}</span>
    </template>

    <TbButton v-if="result.kind === 'empty'" variant="secondary" size="sm" @click="emit('loadSample')">Load sample</TbButton>

    <span
      v-if="result.kind !== 'empty'"
      role="status"
      :class="result.kind === 'valid' ? 'tb-badge tb-badge--valid' : 'tb-badge tb-badge--invalid'"
      class="tb-ml-auto"
    >
      {{ result.kind === 'valid' ? 'Valid JSON' : 'Invalid' }}
    </span>
  </div>
</template>
