<script setup lang="ts">
import { useRecentTools } from '@composables/useRecentTools'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import GithubIcon from './GithubIcon.vue'
import { findActiveTool, isToolActive, searchTools, sections } from './logic'
import type { Tool } from './types'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const searchQuery = ref('')
const { recentTools, addRecentTool } = useRecentTools()
const searchResults = computed(() => searchTools(searchQuery.value))

watch(
  () => route.path,
  path => {
    const tool = findActiveTool(path)
    if (tool !== null) {
      addRecentTool(tool.path)
    }
  },
  { immediate: true }
)

function isActive(tool: Tool): boolean {
  return isToolActive(tool, route.path)
}
</script>

<template>
  <div
    v-if="props.open"
    class="fixed inset-0 z-30 bg-black/50 md:hidden"
    @click="emit('close')"
  />
  <nav
    class="fixed inset-y-0 left-0 z-40 w-64 bg-surface-raised border-r border-border flex flex-col transition-transform duration-200 md:static md:translate-x-0 md:shrink-0"
    :class="props.open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="p-5 border-b border-border flex items-center justify-between">
      <h1 class="text-lg font-semibold tracking-tight text-text-primary">
        <span class="text-accent font-bold">&#9670;</span> Dev Toolbox
      </h1>
      <button
        class="md:hidden p-1 text-text-muted hover:text-text-primary"
        type="button"
        @click="emit('close')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <title>Close button</title>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div class="px-3 py-2 border-b border-border">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search tools…"
        class="w-full px-3 py-1.5 rounded-lg text-sm bg-surface-overlay border border-border focus:border-border-focus focus:outline-none text-text-primary placeholder:text-text-muted"
      />
    </div>
    <div class="flex-1 overflow-y-auto py-3 px-3 space-y-4">
      <div v-if="!searchQuery && recentTools.length > 0">
        <p class="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Recent</p>
        <div class="space-y-1">
          <router-link
            v-for="tool in recentTools"
            :key="tool.path"
            :to="tool.path"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            :class="isActive(tool)
              ? 'bg-accent/15 text-accent-hover'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay'"
          >
            <span
              class="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold font-mono shrink-0"
              :class="isActive(tool)
                ? 'bg-accent text-white'
                : 'bg-surface-overlay text-text-muted'"
            >{{ tool.abbreviation }}</span>
            {{ tool.name }}
          </router-link>
        </div>
      </div>
      <div v-if="searchQuery && searchResults.length > 0">
        <div class="space-y-1">
          <router-link
            v-for="tool in searchResults"
            :key="tool.path"
            :to="tool.path"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            :class="isActive(tool)
              ? 'bg-accent/15 text-accent-hover'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay'"
          >
            <span
              class="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold font-mono shrink-0"
              :class="isActive(tool)
                ? 'bg-accent text-white'
                : 'bg-surface-overlay text-text-muted'"
            >{{ tool.abbreviation }}</span>
            {{ tool.name }}
          </router-link>
        </div>
      </div>
      <p
        v-if="searchQuery && searchResults.length === 0"
        class="px-3 py-2 text-sm text-text-muted"
      >No results</p>
      <template v-if="!searchQuery">
        <div v-for="section in sections" :key="section.label">
          <p class="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">{{ section.label }}</p>
          <div class="space-y-1">
            <router-link
              v-for="tool in section.tools"
              :key="tool.path"
              :to="tool.path"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              :class="isActive(tool)
                ? 'bg-accent/15 text-accent-hover'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay'"
            >
              <span
                class="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold font-mono shrink-0"
                :class="isActive(tool)
                  ? 'bg-accent text-white'
                  : 'bg-surface-overlay text-text-muted'"
              >{{ tool.abbreviation }}</span>
              {{ tool.name }}
            </router-link>
          </div>
        </div>
      </template>
    </div>
    <div class="p-4 border-t border-border">
      <a
        href="https://github.com/looorent/toolbox"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-all duration-150"
      >
        <GithubIcon class="w-4 h-4" />
        <span>source</span>
      </a>
    </div>
  </nav>
</template>
