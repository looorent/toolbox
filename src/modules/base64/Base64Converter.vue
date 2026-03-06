<script setup lang="ts">
import { TbCopyButton, TbFieldInput, TbOptionGroup, type TbOptionGroupOption } from '@components'
import { useBidirectionalConverter } from '@composables/useBidirectionalConverter'
import { computed, ref, watch } from 'vue'
import { byteLength, decode, encode } from './logic'
import type { Base64Variant } from './types'

const variant = ref<Base64Variant>('standard')

const { left: text, right: encoded, error, recompute } = useBidirectionalConverter({
  forward: value => encode(value, variant.value),
  backward: value => {
    const result = decode(value, variant.value)
    return result.error
      ? { value: '', error: true }
      : { value: result.text, error: false }
  },
})

watch(variant, recompute)

const encodedSize = computed(() => byteLength(encoded.value))

const variants: TbOptionGroupOption[] = [
  { value: 'standard', label: 'Standard', description: 'RFC 4648 — uses + / and = padding' },
  { value: 'url-safe', label: 'URL-safe', description: 'RFC 4648 §5 — uses - _ and no padding' },
]
</script>

<template>
  <div class="tb-stack-6">
    <p class="tb-text-description">Encode and decode Base64. Type in either field.</p>

    <TbOptionGroup v-model="variant" variant="segmented" label="Variant" :options="variants" />

    <div class="tb-grid-2">
      <TbFieldInput multiline
        v-model="text"
        label="Text"
        placeholder="Hello, World!"
      />

      <div>
        <div class="tb-field-header">
          <label class="tb-label">Base64</label>
          <div class="tb-row tb-row--gap-3">
            <span v-if="encodedSize" class="tb-text-tiny tb-text-muted">{{ encodedSize }} bytes decoded</span>
            <TbCopyButton v-if="encoded" :value="encoded" />
          </div>
        </div>
        <textarea
          v-model="encoded"
          placeholder="SGVsbG8sIFdvcmxkIQ=="
          rows="4"
          class="tb-textarea"
          :class="{ 'tb-textarea--error': error }"
        />
        <p v-if="error" role="alert" class="tb-error-text">Invalid Base64 string.</p>
      </div>
    </div>
  </div>
</template>
