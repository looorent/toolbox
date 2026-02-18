<script setup lang="ts">
import { useBidirectionalConverter } from '@composables/useBidirectionalConverter'
import { ref, watch } from 'vue'
import { urlDecode, urlEncode } from './logic'
import type { UrlEncodeMode } from './types'
import UrlModeToggle from './UrlModeToggle.vue'
import UrlTextArea from './UrlTextArea.vue'

const mode = ref<UrlEncodeMode>('component')

const { left: decoded, right: encoded, error, recompute } = useBidirectionalConverter({
  forward: value => urlEncode(value, mode.value),
  backward: value => {
    const result = urlDecode(value, mode.value)
    return result === null
      ? { value: '', error: true }
      : { value: result, error: false }
  },
})

watch(mode, recompute)
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-text-secondary">Encode and decode URLs. Type in either field.</p>

    <UrlModeToggle v-model="mode" />

    <UrlTextArea
      v-model="decoded"
      label="Decoded"
      placeholder="hello world & foo=bar baz"
    />

    <UrlTextArea
      v-model="encoded"
      label="Encoded"
      placeholder="hello%20world%20%26%20foo%3Dbar%20baz"
      :error="error"
      error-message="Invalid encoded string — contains malformed percent sequences."
    />
  </div>
</template>
