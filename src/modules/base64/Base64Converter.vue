<script setup lang="ts">
import CopyButton from '@components/CopyButton.vue'
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

function selectVariant(value: Base64Variant): void {
  variant.value = value
}

const encodedSize = computed(() => byteLength(encoded.value))

const variants: { value: Base64Variant; label: string; desc: string }[] = [
  { value: 'standard', label: 'Standard', desc: 'RFC 4648 — uses + / and = padding' },
  { value: 'url-safe', label: 'URL-safe', desc: 'RFC 4648 §5 — uses - _ and no padding' },
]
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-text-secondary">Encode and decode Base64. Type in either field.</p>

    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold uppercase tracking-wider text-text-muted">Variant</span>
      <div class="flex rounded-lg border border-border overflow-hidden">
        <button
          v-for="variantOption in variants"
          :key="variantOption.value"
          type="button"
          class="px-3 py-1.5 text-xs font-medium transition-colors"
          :class="variant === variantOption.value
            ? 'bg-accent text-white'
            : 'bg-surface-overlay text-text-secondary hover:text-text-primary'"
          :title="variantOption.desc"
          @click="selectVariant(variantOption.value)"
        >
          {{ variantOption.label }}
        </button>
      </div>
      <span class="text-[10px] text-text-muted hidden sm:inline">{{ variants.find(v => v.value === variant)?.desc }}</span>
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-text-muted">Text</label>
        <CopyButton v-if="text" :value="text" />
      </div>
      <textarea
        v-model="text"
        placeholder="Hello, World!"
        rows="4"
        class="w-full bg-surface-overlay border border-border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition-colors resize-y"
      />
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-text-muted">Base64</label>
        <div class="flex items-center gap-3">
          <span v-if="encodedSize" class="text-[10px] text-text-muted">{{ encodedSize }} bytes decoded</span>
          <CopyButton v-if="encoded" :value="encoded" />
        </div>
      </div>
      <textarea
        v-model="encoded"
        placeholder="SGVsbG8sIFdvcmxkIQ=="
        rows="4"
        class="w-full bg-surface-overlay border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none transition-colors resize-y"
        :class="error ? 'border-error' : 'border-border focus:border-border-focus'"
      />
      <p v-if="error" class="mt-1 text-xs text-error">Invalid Base64 string.</p>
    </div>
  </div>
</template>
