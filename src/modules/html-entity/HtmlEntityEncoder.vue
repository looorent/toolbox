<script setup lang="ts">
import { TbFieldInput, TbOptionGroup, type TbOptionGroupOption } from '@components'
import { useBidirectionalConverter } from '@composables/useBidirectionalConverter'
import { ref, watch } from 'vue'
import { decodeEntities, encodeEntities } from './logic'
import type { EntityFormat } from './types'

const format = ref<EntityFormat>('named')

const { left: decoded, right: encoded, recompute } = useBidirectionalConverter({
  forward: value => encodeEntities(value, format.value),
  backward: value => ({ value: decodeEntities(value), error: false }),
})

watch(format, recompute)

const formatOptions: TbOptionGroupOption[] = [
  { value: 'named', label: 'Named' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'hex', label: 'Hex' },
]
</script>

<template>
  <div class="tb-stack-6">
    <p class="tb-text-description">Encode and decode HTML entities. Type in either field.</p>

    <TbOptionGroup v-model="format" variant="segmented" label="Format" :options="formatOptions" />

    <div class="tb-grid-2">
      <TbFieldInput multiline
        v-model="decoded"
        label="Plain Text"
        placeholder='<div class="example">Hello & welcome</div>'
      />

      <TbFieldInput multiline
        v-model="encoded"
        label="Encoded"
        placeholder="&lt;div class=&quot;example&quot;&gt;Hello &amp; welcome&lt;/div&gt;"
      />
    </div>
  </div>
</template>
