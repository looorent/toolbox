<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyRow from '@/components/CopyRow.vue'
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
</script>

<template>
  <div class="bg-surface-overlay border border-border rounded-lg overflow-hidden">
    <div class="flex items-center justify-between px-4 py-2 border-b border-border">
      <h3 class="text-xs font-semibold uppercase tracking-wider" :class="color">{{ title }}</h3>
      <div class="flex gap-1">
        <button
          v-for="view in (['table', 'json'] as const)"
          :key="view"
          type="button"
          class="px-2 py-0.5 text-xs rounded transition-colors"
          :class="currentView === view ? 'bg-surface-base text-text-primary' : 'text-text-muted hover:text-text-secondary'"
          @click="setView(view)"
        >
          {{ view === 'table' ? 'Claims' : 'JSON' }}
        </button>
      </div>
    </div>
    <div class="px-4 py-3">
      <CopyRow v-if="currentView === 'json'" :value="json">
        <pre class="text-sm font-mono text-text-primary overflow-x-auto">{{ json }}</pre>
      </CopyRow>
      <div v-else>
        <CopyRow
          v-for="(value, key) in data"
          :key="key"
          :value="rawClaimValue(value)"
          class="flex items-start gap-4 py-1.5 border-b border-border/50 last:border-0 text-sm"
        >
          <span class="text-text-muted whitespace-nowrap">
            {{ labels[key as string] ?? key }}
            <span v-if="labels[key as string]" class="text-xs text-text-muted/60 ml-1">({{ key }})</span>
          </span>
          <span class="font-mono text-text-primary">
            {{ formatValue(key as string, value) }}
          </span>
        </CopyRow>
      </div>
    </div>
  </div>
</template>
