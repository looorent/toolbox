<script setup lang="ts">
import { TbCopyRow, TbInput, TbOptionGroup, type TbOptionGroupOption } from '@components'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { filterSheetEntries, sheets } from './logic'

const route = useRoute()
const router = useRouter()

const searchQuery = ref('')

const sheetKeys = sheets.map(sheet => sheet.key)

const sheetOptions: TbOptionGroupOption[] = sheets.map(sheet => ({ value: sheet.key, label: sheet.label }))

const activeSheetKey = computed({
  get: () => {
    const param = route.params.sheet as string | undefined
    return param && sheetKeys.includes(param) ? param : sheets[0].key
  },
  set: key => {
    router.replace(`/cheat-sheets/${key}`)
  },
})

const activeSheet = computed(() => sheets.find(sheet => sheet.key === activeSheetKey.value) ?? sheets[0])

const filteredCategories = computed(() => filterSheetEntries(activeSheet.value, searchQuery.value))

const totalMatches = computed(() => filteredCategories.value.reduce((sum, category) => sum + category.entries.length, 0))

watch(activeSheetKey, () => searchQuery.value = '')
</script>

<template>
  <div class="tb-stack-6">
    <p class="tb-text-description">Quick reference cheat sheets for common developer tools. Click any entry to copy.</p>

    <TbOptionGroup v-model="activeSheetKey" :options="sheetOptions" size="sm" />

    <TbInput v-model="searchQuery" :placeholder="`Search ${activeSheet.label}...`" class="tb-font-sans" />

    <p v-if="searchQuery.trim()" class="tb-hint">
      {{ totalMatches }} {{ totalMatches === 1 ? 'result' : 'results' }}
    </p>

    <div v-if="filteredCategories.length > 0" class="tb-stack-6">
      <div v-for="category in filteredCategories" :key="category.category">
        <h3 class="tb-label">{{ category.category }}</h3>
        <div class="tb-stack-2">
          <TbCopyRow
            v-for="entry in category.entries"
            :key="entry.command"
            :value="entry.command"
            class="tb-copy-row--stacked"
          >
            <code class="tb-font-mono tb-text-sm tb-text-primary tb-flex-shrink-0">{{ entry.command }}</code>
            <span class="tb-text-description">{{ entry.description }}</span>
          </TbCopyRow>
        </div>
      </div>
    </div>

    <p v-else class="tb-empty-text">No matches found for "{{ searchQuery }}"</p>
  </div>
</template>
