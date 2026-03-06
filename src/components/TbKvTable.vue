<script setup lang="ts">
import { useCopy } from '@composables/useCopy'

export type KvEntry = { key: string; value: string; [extra: string]: unknown }

export type TbKvTableKeySize = 'xs' | 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  entries: KvEntry[]
  keySize?: TbKvTableKeySize
  copyable?: boolean
}>(), {
  keySize: undefined,
  copyable: false,
})

const { copy, copiedKey } = useCopy()

function onRowClick(entry: KvEntry) {
  if (props.copyable) {
    copy(entry.key, entry.value)
  }
}
</script>

<template>
  <div class="tb-kv-table" :class="keySize ? `tb-kv-table--key-${keySize}` : ''">
    <div
      v-for="entry in entries"
      :key="entry.key"
      class="tb-kv-table__row"
      :class="{ 'tb-kv-table__row--copyable': copyable }"
      :role="copyable ? 'button' : undefined"
      :tabindex="copyable ? 0 : undefined"
      @click="onRowClick(entry)"
      @keydown.enter="onRowClick(entry)"
      @keydown.space.prevent="onRowClick(entry)"
    >
      <span class="tb-kv-table__key">
        <slot name="key" :entry="entry">{{ entry.key }}</slot>
      </span>
      <span class="tb-kv-table__value">
        <slot name="value" :entry="entry">{{ entry.value }}</slot>
      </span>
      <span v-if="copyable && copiedKey === entry.key" role="status" class="tb-kv-table__copied">Copied!</span>
    </div>
  </div>
</template>
