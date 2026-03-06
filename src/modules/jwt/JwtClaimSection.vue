<script setup lang="ts">
import { TbCard, TbCodeEditor, TbKvTable } from '@components'
import { computed, ref } from 'vue'
import { rawClaimValue } from './logic'

type SectionView = 'table' | 'json'

const props = defineProps<{
  title: string
  color: string
  data: Record<string, unknown>
  labels: Record<string, string>
  formatValue: (key: string, value: unknown) => string
}>()

const currentView = ref<SectionView>('table')

function setView(view: SectionView) {
  currentView.value = view
}

const json = computed(() => JSON.stringify(props.data, null, 2))

const claimEntries = computed(() =>
  Object.entries(props.data).map(([key, value]) => ({
    key,
    value: rawClaimValue(value),
    label: props.labels[key] ?? key,
    displayValue: props.formatValue(key, value),
  }))
)
</script>

<template>
  <TbCard sectioned :title="title" :title-class="color">
    <template #actions>
      <div class="tb-row tb-row--gap-1">
        <button
          v-for="view in (['table', 'json'] as const)"
          :key="view"
          type="button"
          class="tb-btn-mini"
          :class="{ 'tb-btn-mini--active': currentView === view }"
          @click="setView(view)"
        >
          {{ view === 'table' ? 'Claims' : 'JSON' }}
        </button>
      </div>
    </template>

    <TbCodeEditor
      v-if="currentView === 'json'"
      v-model="json"
      status="idle"
      readonly
      copyable
    />

    <TbKvTable v-else :entries="claimEntries" copyable key-size="md">
      <template #key="{ entry }">
        <span class="tb-nowrap">
          {{ entry.label }}
          <span v-if="labels[entry.key]" class="tb-hint tb-ml-2">({{ entry.key }})</span>
        </span>
      </template>
      <template #value="{ entry }">
        {{ entry.displayValue }}
      </template>
    </TbKvTable>
  </TbCard>
</template>
