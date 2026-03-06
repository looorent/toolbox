<script setup lang="ts">
import { TbFieldInput, TbOptionGroup, type TbOptionGroupOption } from '@components'
import { useBidirectionalConverter } from '@composables/useBidirectionalConverter'
import { ref, watch } from 'vue'
import { urlDecode, urlEncode } from './logic'
import type { UrlEncodeMode } from './types'

const mode = ref<UrlEncodeMode>('component')
const modes: TbOptionGroupOption[] = [
  { value: 'component', label: 'Component', description: 'encodeURIComponent — for query param values' },
  { value: 'full', label: 'Full URI', description: "encodeURI — preserves :/?#[]@!$&'()*+,;=" },
]

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
  <div class="tb-stack-6">
    <p class="tb-text-description">Encode and decode URLs. Type in either field.</p>

    <TbOptionGroup v-model="mode" variant="segmented" label="Mode" :options="modes" />

    <div class="tb-grid-2">
      <TbFieldInput multiline
        v-model="decoded"
        label="Decoded"
        placeholder="hello world & foo=bar baz"
      />

      <TbFieldInput multiline
        v-model="encoded"
        label="Encoded"
        placeholder="hello%20world%20%26%20foo%3Dbar%20baz"
        :error="error"
        error-message="Invalid encoded string — contains malformed percent sequences."
      />
    </div>
  </div>
</template>
