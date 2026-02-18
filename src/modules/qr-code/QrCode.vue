<script setup lang="ts">
import { ref } from 'vue'
import QrGenerator from './QrGenerator.vue'
import QrScanner from './QrScanner.vue'

type Tab = 'generate' | 'scan'

const activeTab = ref<Tab>('generate')

const tabs = [
  { key: 'generate' as Tab, label: 'Generate' },
  { key: 'scan' as Tab, label: 'Scanner' },
]

function changeTab(newTab: Tab) {
  activeTab.value = newTab
}

</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer"
        :class="activeTab === tab.key
          ? 'bg-accent text-white'
          : 'bg-surface-overlay text-text-secondary hover:text-text-primary border border-border'"
        @click="changeTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <QrGenerator v-if="activeTab === 'generate'" />
    <QrScanner v-if="activeTab === 'scan'" />
  </div>
</template>
