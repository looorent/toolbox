<script setup lang="ts">
import { useCopy } from '@composables/useCopy'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { filterSheetEntries, sheets } from './logic'

const route = useRoute()
const router = useRouter()
const { copy, copiedKey } = useCopy()

const searchQuery = ref('')

const sheetKeys = sheets.map(sheet => sheet.key)

const activeSheetKey = computed(() => {
  const param = route.params.sheet as string | undefined
  return param && sheetKeys.includes(param) ? param : sheets[0].key
})

const activeSheet = computed(() => sheets.find(sheet => sheet.key === activeSheetKey.value) ?? sheets[0])

const filteredCategories = computed(() => filterSheetEntries(activeSheet.value, searchQuery.value))

const totalMatches = computed(() => filteredCategories.value.reduce((sum, category) => sum + category.entries.length, 0))

function navigateToSheet(key: string) {
  router.replace(`/cheat-sheets/${key}`)
}

watch(activeSheetKey, () => searchQuery.value = '')
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-text-secondary">Quick reference cheat sheets for common developer tools. Click any entry to copy.</p>

    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="sheet in sheets"
        :key="sheet.key"
        type="button"
        class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
        :class="activeSheetKey === sheet.key
          ? 'bg-accent text-white'
          : 'bg-surface-overlay text-text-secondary hover:text-text-primary border border-border'"
        @click="navigateToSheet(sheet.key)"
      >
        {{ sheet.label }}
      </button>
    </div>

    <input
      v-model="searchQuery"
      type="text"
      :placeholder="`Search ${activeSheet.label}...`"
      class="w-full bg-surface-overlay border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus transition-colors"
    />

    <p v-if="searchQuery.trim()" class="text-xs text-text-muted">
      {{ totalMatches }} {{ totalMatches === 1 ? 'result' : 'results' }}
    </p>

    <div v-if="filteredCategories.length > 0" class="space-y-6">
      <div v-for="category in filteredCategories" :key="category.category">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">{{ category.category }}</h3>
        <div class="space-y-1.5">
          <div
            v-for="entry in category.entries"
            :key="entry.command"
            class="bg-surface-overlay border border-border rounded-lg px-4 py-3 cursor-pointer hover:border-border-focus transition-colors flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
            @click="copy(entry.command, entry.command)"
          >
            <code class="font-mono text-sm text-text-primary shrink-0">{{ entry.command }}</code>
            <span class="text-sm text-text-secondary sm:ml-auto text-left sm:text-right">{{ entry.description }}</span>
            <span
              v-if="copiedKey === entry.command"
              class="text-[10px] text-success font-medium shrink-0"
            >Copied!</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-sm text-text-muted">No matches found for "{{ searchQuery }}"</p>
    </div>
  </div>
</template>
